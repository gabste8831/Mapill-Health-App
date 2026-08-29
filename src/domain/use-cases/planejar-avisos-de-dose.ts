import type { AvisoDeDose } from "../ports/notification-gateway";
import type { ReminderMode } from "../entities/prescription";

/**
 * O que este use-case precisa saber sobre cada dose agendada. Deliberadamente menos que a
 * entidade `DoseSchedule`: quem chama monta isto juntando dose, prescrição e medicamento, e a
 * regra aqui não depende de nada além destes campos.
 */
export type DoseAAvisar = {
  doseScheduleId: string;
  /** Instante ISO em que a dose deve ser tomada. */
  scheduledFor: string;
  medicationName: string;
  /**
   * O texto pronto da quantidade — "1 comprimido", "2 comprimidos", "7,5 ml".
   *
   * Chega formatado em vez de o domínio flexionar aqui: quem sabe pluralizar é
   * `formatarQuantidade` (em `shared/`), que já trata o caso de abreviação não flexionar ("2 mg",
   * nunca "2 mgs"). E `shared/` importa **do** domínio, então importá-lo de volta inverteria a
   * direção da dependência da Clean Architecture. Reimplementar a regra aqui criaria um segundo
   * lugar onde o plural pode divergir.
   */
  quantidadeFormatada: string;
  reminderMode: ReminderMode;
  /** Doses já resolvidas não geram aviso: não há o que lembrar do que já foi respondido. */
  jaResolvida: boolean;
  jaAdiada: boolean;
};

export type PlanejarAvisosInput = {
  doses: DoseAAvisar[];
  /** Nada no passado é agendado — o sistema recusaria, e prometer o impossível é pior que calar. */
  agora: Date;
  /**
   * Até quando agendar. A janela existe porque "3x ao dia por 6 meses" são 540 avisos para **uma**
   * prescrição, e um paciente polimedicado passaria de 2.500 — acima do que qualquer sistema
   * operacional aceita manter pendente. A janela é reabastecida a cada abertura do app.
   */
  ate: Date;
};

/**
 * Minutos de tolerância para o aviso que "acabou de passar".
 *
 * Sem isso, reabrir o app às 08:00:30 cancelaria e não reagendaria o aviso das 08:00 — a dose
 * ficaria sem lembrete nenhum justamente no minuto em que ele importa. Com a folga, o aviso é
 * reagendado para daqui a instantes e ainda chega.
 */
const TOLERANCIA_DE_ATRASO_EM_MINUTOS = 2;

/** `2026-08-29T08:00:00.000Z` → chave estável do horário. Mesmo instante, mesma chave. */
function chaveDoHorario(scheduledFor: string): string {
  return `dose-${scheduledFor}`;
}

/** "08:00" a partir do instante, no fuso do aparelho — que é onde a pessoa lê a hora. */
function horaLocal(instante: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${p(instante.getHours())}:${p(instante.getMinutes())}`;
}

/**
 * O aviso é do **horário**, e o modo é o mais exigente entre as doses dele.
 *
 * Duas doses no mesmo minuto, uma marcada como alarme e outra como notificação, não podem virar
 * dois avisos — seriam dois toques seguidos dizendo a mesma coisa. Viram um só, e ele toca como
 * alarme: rebaixar para notificação silenciaria um lembrete que a pessoa pediu alto, e é sempre
 * pior errar para menos num aviso de medicação.
 */
function modoDoHorario(modos: ReminderMode[]): "alarm" | "notification" | null {
  if (modos.some((modo) => modo === "alarm" || modo === "both")) return "alarm";
  if (modos.some((modo) => modo === "notification")) return "notification";
  return null;
}

/**
 * Transforma as doses agendadas nos avisos que o sistema operacional deve conhecer.
 *
 * **Um aviso por horário, e não por dose.** Quem toma quatro remédios às 08:00 receberia quatro
 * notificações idênticas em sequência, e o quarto aviso ensina a ignorar o primeiro. O aviso lista
 * o que há para tomar, e a tela do horário — aberta ao tocar nele — é onde cada dose se resolve
 * individualmente.
 *
 * Regra pura: nenhuma dependência de Expo, banco ou relógio do sistema (o `agora` é injetado).
 * É o que permite provar o agendamento em Node, sem aparelho — a mesma abordagem de
 * `generate-dose-schedules`.
 */
export function planejarAvisosDeDose(input: PlanejarAvisosInput): AvisoDeDose[] {
  const limiteInferior = new Date(
    input.agora.getTime() - TOLERANCIA_DE_ATRASO_EM_MINUTOS * 60_000,
  );

  const porHorario = new Map<string, DoseAAvisar[]>();
  for (const dose of input.doses) {
    // Já respondida não tem o que lembrar, e `none` é uma recusa explícita de ser avisado.
    if (dose.jaResolvida) continue;
    if (dose.reminderMode === "none") continue;

    const quando = new Date(dose.scheduledFor);
    if (quando < limiteInferior) continue;
    if (quando > input.ate) continue;

    const existentes = porHorario.get(dose.scheduledFor);
    if (existentes === undefined) porHorario.set(dose.scheduledFor, [dose]);
    else existentes.push(dose);
  }

  const avisos: AvisoDeDose[] = [];
  for (const [scheduledFor, doses] of porHorario) {
    const modo = modoDoHorario(doses.map((dose) => dose.reminderMode));
    if (modo === null) continue;

    const quando = new Date(scheduledFor);
    const hora = horaLocal(quando);
    // Ordem estável dentro do aviso: o mesmo horário sempre lista os remédios na mesma sequência,
    // e uma lista que se reordena sozinha entre um dia e outro obriga a reler o que já se sabia.
    const ordenadas = [...doses].sort((a, b) => a.medicationName.localeCompare(b.medicationName));

    const linhas = ordenadas.map(
      (dose) => `${dose.medicationName} — ${dose.quantidadeFormatada}`,
    );

    avisos.push({
      chave: chaveDoHorario(scheduledFor),
      quando,
      // Com um remédio o nome vai no título, porque é a informação que resolve o aviso sem abri-lo.
      // Com vários não cabe, e a contagem é o que orienta: ela diz quantas respostas faltam.
      titulo:
        ordenadas.length === 1
          ? `${hora} — ${ordenadas[0].medicationName}`
          : `${hora} — ${ordenadas.length} remédios`,
      corpo: linhas.join("\n"),
      doseScheduleIds: ordenadas.map((dose) => dose.doseScheduleId),
      modo,
      // Basta uma dose já adiada para o horário ter gasto seu adiamento: a trava é do aviso, que
      // é o que a pessoa adiou, e não de cada dose que ele carrega.
      jaAdiado: ordenadas.some((dose) => dose.jaAdiada),
    });
  }

  // Cronológica: quem inspeciona os pendentes (e o log do spike) lê na ordem em que vão tocar.
  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}
