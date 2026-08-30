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
    // Ordem estável dentro do aviso: o mesmo horário sempre lista os remédios na mesma sequência,
    // e uma lista que se reordena sozinha entre um dia e outro obriga a reler o que já se sabia.
    const ordenadas = [...doses].sort((a, b) => a.medicationName.localeCompare(b.medicationName));

    /**
     * Uma linha por remédio, com dois pontos separando o nome da quantidade.
     *
     * Travessão saiu: em fonte pequena, na barra de notificação, ele se confunde com hífen de
     * palavra composta e some no meio do texto. Dois pontos leem como "isto, nesta quantidade",
     * que é exatamente a relação entre as duas partes.
     */
    const linhas = ordenadas.map((dose) => `${dose.medicationName}: ${dose.quantidadeFormatada}`);

    avisos.push({
      chave: chaveDoHorario(scheduledFor),
      quando,
      /**
       * O título diz **o que é**, e o corpo diz **o que tomar**.
       *
       * Antes o título era `08:00 — Losartana`, o que repetia duas informações que o sistema já
       * mostra: a hora aparece no canto da própria notificação, e o nome do remédio reaparecia na
       * linha de baixo. Sobrava um aviso que dizia três vezes a mesma coisa e nenhuma vez o que
       * ele queria de quem estava lendo.
       *
       * "Hora do seu remédio" é a frase que faz alguém entender o aviso sem abri-lo, mesmo de
       * relance na tela bloqueada. Com mais de um remédio a contagem entra, porque aí ela é o que
       * orienta: diz quantas respostas faltam antes de a pessoa tocar.
       */
      titulo:
        ordenadas.length === 1
          ? "Hora do seu remédio"
          : `Hora dos seus remédios (${ordenadas.length})`,
      corpo: linhas.join("\n"),
      doseScheduleIds: ordenadas.map((dose) => dose.doseScheduleId),
      modo,
      // Basta uma dose já adiada para o horário ter gasto seu adiamento: a trava é do aviso, que
      // é o que a pessoa adiou, e não de cada dose que ele carrega.
      semAcoesRapidas: ordenadas.some((dose) => dose.jaAdiada),
    });
  }

  // Cronológica: quem inspeciona os pendentes (e o log do spike) lê na ordem em que vão tocar.
  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}
