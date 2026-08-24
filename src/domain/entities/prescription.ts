import type { PosologyUnit } from "./medication";
import type { SyncableEntity } from "./syncable";

/**
 * Livre por prescrição, não global — cada tratamento tem sua própria criticidade
 * (ex: insulina pede alarme, suplemento de rotina pode ser só notificação ou nada).
 *
 * `both` existe porque os dois canais fazem coisas diferentes: o alarme interrompe a pessoa na
 * hora, e a notificação **fica** na barra depois de dispensado. Quem precisa das duas coisas
 * estava tendo que escolher uma.
 */
export type ReminderMode = "alarm" | "notification" | "both" | "none";

/** Horário do dia em `HH:MM`, 24h. */
export type TimeOfDay = string;

/**
 * Uma dose a cada duas horas já é o limite do que uma pessoa acordada consegue cumprir — acima
 * disso o cadastro descreveria uma rotina que ninguém executa.
 *
 * Quem pensa a posologia por intervalo ("de 8 em 8 horas") continua atendido: o seletor de
 * horários converte o intervalo nos horários equivalentes, sem que exista uma frequência separada
 * levando ao mesmo agendamento.
 */
export const MAX_DOSES_PER_DAY = 12;

/** Até aqui o cadastro oferece botão pronto; além disso o paciente digita a quantidade. */
export const COMMON_DOSES_PER_DAY = 4;

/** 0 = domingo … 6 = sábado, igual ao `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Um horário do dia e quanto se toma nele.
 *
 * `amount: null` = "o mesmo de sempre", isto é, o `doseAmount` da prescrição. Existe porque a
 * esmagadora maioria dos tratamentos tem dose uniforme, e repetir o mesmo número em cada horário
 * criaria três lugares onde a verdade pode divergir. Preenchido, ele vale só para este horário —
 * é o que permite insulina 10 UI de manhã e 8 UI à noite num cadastro só.
 */
export type ScheduledDose = {
  at: TimeOfDay;
  amount: number | null;
};

/**
 * As quatro formas de posologia que o app aceita.
 *
 * Todas as três que agendam respondem à mesma pergunta — **em quais dias** —, e os horários do
 * dia são um eixo separado, comum às três. Foi essa separação que eliminou "a cada X horas":
 * ela misturava os dois eixos, e como todo intervalo oferecido dividia o dia por igual, produzia
 * exatamente o mesmo resultado que `daily` com os horários equivalentes. Dois caminhos para o
 * mesmo destino é dúvida na hora de escolher, e nada além disso.
 */
export type PosologySchedule =
  /** Todo dia, nos mesmos horários. Ex: 08:00 e 20:00. */
  | { kind: "daily"; doses: ScheduledDose[] }
  /** Só em certos dias da semana. Ex: segunda e quinta às 09:00. */
  | { kind: "weekly"; weekdays: Weekday[]; doses: ScheduledDose[] }
  /**
   * Repete a cada `cycleLengthDays`, tomando nos `activeDays` primeiros. Um mecanismo só para
   * três coisas que as pessoas dizem de jeitos diferentes: cartela de anticoncepcional (28 e 21),
   * dia sim dia não (2 e 1) e injeção "de 30 em 30 dias" (30 e 1).
   *
   * `cycleStartDate` é o primeiro dia do ciclo atual, e não o dia do cadastro — quem cadastra no
   * quinto dia da cartela receberia a pausa cinco dias atrasada, sem nada na tela denunciando.
   *
   * Contado em dias, o ciclo escorrega no calendário: "a cada 30 dias" a partir de 25/01 cai em
   * 24/02. É o preço de não ter uma frequência mensal separada — e o que se ganha é não ter duas
   * opções que respondem à mesma pergunta.
   */
  | {
      kind: "cycle";
      cycleLengthDays: number;
      activeDays: number;
      cycleStartDate: string;
      doses: ScheduledDose[];
    }
  /** Sem horário: o paciente toma quando precisa, e nada é agendado. */
  | { kind: "asNeeded" };

/** Os horários de um schedule, ou lista vazia quando ele não agenda nada. */
export function dosesOfSchedule(schedule: PosologySchedule): ScheduledDose[] {
  return schedule.kind === "asNeeded" ? [] : schedule.doses;
}

/** Receita pode vir da câmera ou de um arquivo já salvo — muda como é aberta pra visualizar. */
export type PrescriptionAttachmentKind = "image" | "document";

/**
 * Recomendações de como tomar, copiadas pelo paciente da bula ou do que o médico disse. São
 * **anotação**: não mudam horário, dose nem lembrete — existem pra aparecer junto da dose na
 * hora de tomar, que é quando a pergunta "esse era em jejum?" acontece.
 *
 * Lista fechada em vez de texto livre: quem cadastra apressado não escreve, mas reconhece e
 * toca. Fora dela, sobra a observação livre.
 */
export type IntakeInstruction =
  | "fasting"
  | "withMeal"
  | "afterMeal"
  | "plentyOfWater"
  | "stayUpright"
  | "avoidAlcohol";

export const INTAKE_INSTRUCTIONS: readonly IntakeInstruction[] = [
  "fasting",
  "withMeal",
  "afterMeal",
  "plentyOfWater",
  "stayUpright",
  "avoidAlcohol",
];

export type Prescription = SyncableEntity & {
  medicationId: string;
  doseAmount: number;
  doseUnit: PosologyUnit;
  schedule: PosologySchedule;
  startDate: string;
  /** null = tratamento contínuo, não "esqueceram de preencher". */
  endDate: string | null;
  reminderMode: ReminderMode;
  /** Vazio = nenhuma marcada, não "não perguntamos". */
  intakeInstructions: IntakeInstruction[];
  /**
   * O que a lista fechada não cobriu — "diluir em meio copo", "não partir o comprimido".
   * Separado de `notes` porque acompanha a dose na hora de tomar, e não o tratamento.
   */
  intakeNote: string | null;
  /** Observação livre do paciente sobre o tratamento como um todo. */
  notes: string | null;
  /** Receita anexada. Caminho local — nunca URL remota direta, ver `attachmentSyncOptOut`. */
  attachmentUri: string | null;
  attachmentKind: PrescriptionAttachmentKind | null;
  /** Validade da receita em ISO `YYYY-MM-DD` — base do lembrete de renovação. */
  attachmentValidUntil: string | null;
  /**
   * Com quantos dias de antecedência avisar que a receita vence. `null` = não avisar.
   *
   * Existe separado da validade porque saber a data e querer ser avisado são decisões
   * diferentes: quem anexa a receita de um uso contínuo quer o aviso, quem anexa a de um
   * antibiótico de 7 dias não quer ser incomodado por algo que vai acabar antes.
   */
  renewalReminderLeadDays: number | null;
  /**
   * LGPD: receita é dado sensível de saúde. Se true, o anexo nunca sobe pro Supabase Storage
   * mesmo com backup habilitado — fica só no aparelho (decisão nº10).
   */
  attachmentSyncOptOut: boolean;
};
