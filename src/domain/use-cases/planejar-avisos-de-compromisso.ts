import type { AvisoDeDose } from "../ports/notification-gateway";

/**
 * O que este use-case precisa saber sobre cada compromisso. Menos que a entidade `Appointment` de
 * propósito: a regra aqui não depende de local, profissional nem do desfecho.
 */
export type CompromissoAAvisar = {
  appointmentId: string;
  /** Instante do compromisso, em ISO. */
  scheduledFor: string;
  titulo: string;
  /** Dias de antecedência do aviso para se organizar. `null` = não quer. */
  reminderLeadDays: number | null;
  /** Avisar também na manhã do próprio dia. */
  reminderOnDay: boolean;
  /** Já respondido ("fui" / "não fui") não tem o que lembrar. */
  jaRespondido: boolean;
};

/**
 * Uma receita com validade e pedido de aviso. Vem da prescrição, e não do compromisso — mas o aviso
 * que ela gera é da mesma natureza: um ponto no tempo com antecedência em dias.
 */
export type ReceitaAAvisar = {
  prescriptionId: string;
  medicationName: string;
  /** `YYYY-MM-DD` — a validade é um dia, não um instante. */
  validUntil: string;
  /** Dias de antecedência. `null` = a pessoa não pediu aviso para esta receita. */
  renewalReminderLeadDays: number | null;
};

export type PlanejarAvisosDeCompromissoInput = {
  compromissos: CompromissoAAvisar[];
  receitas: ReceitaAAvisar[];
  agora: Date;
  /** Fim da janela de agendamento, igual à das doses. */
  ate: Date;
};

/**
 * A que horas cai o aviso "no dia" e o de antecedência.
 *
 * Cedo, mas não de madrugada. Um aviso de consulta às 3h da manhã acorda para dizer algo que só
 * será útil dez horas depois — e o que ele consegue é que a pessoa desligue os avisos do app.
 * Oito da manhã é quando o dia começa a ser organizado, que é justamente o que este aviso serve
 * para permitir: remarcar o trabalho, arrumar carona.
 */
const HORA_DO_AVISO = 8;

const PREFIXO_COMPROMISSO = "compromisso-";
const PREFIXO_RECEITA = "receita-";

/** Um dia específico às 08:00, no fuso do aparelho. */
function manhaDe(dia: Date): Date {
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), HORA_DO_AVISO, 0, 0, 0);
}

/** `YYYY-MM-DD` → `Date` local. Sem `new Date(iso)`, que interpretaria como UTC e voltaria um dia. */
function diaLocal(isoDay: string): Date {
  const [ano, mes, dia] = isoDay.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function diasAntes(instante: Date, dias: number): Date {
  return new Date(instante.getTime() - dias * 24 * 60 * 60_000);
}

/** `2026-09-04T14:30` → "sexta, 4 de setembro, às 14:30". */
const DIAS_DA_SEMANA = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];
const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function quandoPorExtenso(instante: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  const dia = DIAS_DA_SEMANA[instante.getDay()];
  const hora = `${p(instante.getHours())}:${p(instante.getMinutes())}`;
  return `${dia}, ${instante.getDate()} de ${MESES[instante.getMonth()]}, às ${hora}`;
}

function dataPorExtenso(dia: Date): string {
  return `${dia.getDate()} de ${MESES[dia.getMonth()]}`;
}

/**
 * Os avisos de compromisso e de renovação de receita.
 *
 * Reusa `AvisoDeDose` de propósito: a estrutura de um aviso agendado é a mesma — quando tocar, o
 * que dizer, e o que ele carrega. O que muda é o **modo**, sempre `notification` e nunca `alarm`
 * (decisão de 24/08): interromper como despertador se justifica na dose, que tem hora exata e
 * consequência clínica imediata; para uma consulta na semana que vem seria só barulho.
 *
 * `doseScheduleIds` fica vazio nestes avisos — eles não apontam para dose nenhuma. É o que faz o
 * toque abrir o app em vez da tela de horário, sem precisar de um segundo tipo de dado.
 *
 * Regra pura, com `agora` injetado: verificável em Node, sem aparelho.
 */
export function planejarAvisosDeCompromisso(
  input: PlanejarAvisosDeCompromissoInput,
): AvisoDeDose[] {
  const avisos: AvisoDeDose[] = [];

  function agendavel(quando: Date): boolean {
    return quando > input.agora && quando <= input.ate;
  }

  for (const compromisso of input.compromissos) {
    // Respondido não tem o que lembrar; passado, tampouco — e o formulário já impede configurar
    // aviso para o que passou, mas a data pode ter chegado desde então.
    if (compromisso.jaRespondido) continue;
    const instante = new Date(compromisso.scheduledFor);
    if (instante <= input.agora) continue;

    if (compromisso.reminderLeadDays !== null) {
      const quando = manhaDe(diasAntes(instante, compromisso.reminderLeadDays));
      if (agendavel(quando)) {
        avisos.push({
          chave: `${PREFIXO_COMPROMISSO}${compromisso.appointmentId}-antes`,
          quando,
          // O prazo no título é o que faz o aviso ser útil de relance: "daqui a 3 dias" responde
          // sozinho se dá tempo de remarcar alguma coisa.
          titulo:
            compromisso.reminderLeadDays === 1
              ? "Compromisso amanhã"
              : `Compromisso em ${compromisso.reminderLeadDays} dias`,
          corpo: `${compromisso.titulo}\n${quandoPorExtenso(instante)}`,
          doseScheduleIds: [],
          modo: "notification",
          semAcoesRapidas: true,
        });
      }
    }

    if (compromisso.reminderOnDay) {
      const quando = manhaDe(instante);
      if (agendavel(quando)) {
        avisos.push({
          chave: `${PREFIXO_COMPROMISSO}${compromisso.appointmentId}-no-dia`,
          quando,
          titulo: "Compromisso hoje",
          corpo: `${compromisso.titulo}\n${quandoPorExtenso(instante)}`,
          doseScheduleIds: [],
          modo: "notification",
          semAcoesRapidas: true,
        });
      }
    }
  }

  for (const receita of input.receitas) {
    if (receita.renewalReminderLeadDays === null) continue;

    const vencimento = diaLocal(receita.validUntil);
    const quando = manhaDe(diasAntes(vencimento, receita.renewalReminderLeadDays));
    if (!agendavel(quando)) continue;

    avisos.push({
      chave: `${PREFIXO_RECEITA}${receita.prescriptionId}`,
      quando,
      titulo: "Receita vencendo",
      // Diz o remédio e a data, porque a ação que se espera — marcar consulta para renovar —
      // depende de saber qual receita e quanto tempo ainda há.
      corpo: `A receita de ${receita.medicationName} vence em ${dataPorExtenso(vencimento)}.`,
      doseScheduleIds: [],
      modo: "notification",
      semAcoesRapidas: true,
    });
  }

  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}
