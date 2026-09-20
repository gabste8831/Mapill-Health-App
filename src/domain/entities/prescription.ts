import type { PosologyUnit } from "./medication";
import type { SyncableEntity } from "./syncable";

/**
 * Livre por prescricao, e nao global: insulina pede alarme, suplemento de rotina talvez nada.
 *
 * `both` esta aposentado. Ele emitia alarme e notificacao para o mesmo horario, e o problema nao
 * era emitir os dois, era mante-los consistentes: a dose confirmada pela notificacao era descontada
 * de novo pelo alarme, que seguia aberto com a lista de antes.
 *
 * Continua no tipo porque pode estar gravado em tratamentos antigos; `planejar-avisos-de-dose` o le
 * como `alarm`, que e o modo mais forte e o que aquela escolha buscava.
 */
export type ReminderMode = "alarm" | "notification" | "both" | "none";

/** Horário do dia em `HH:MM`, 24h. */
export type TimeOfDay = string;

/**
 * Uma dose a cada duas horas ja e o limite do que uma pessoa acordada cumpre.
 *
 * Quem pensa por intervalo ("de 8 em 8 horas") continua atendido: o seletor converte o intervalo
 * nos horarios equivalentes, sem uma frequencia separada levando ao mesmo agendamento.
 */
export const MAX_DOSES_PER_DAY = 12;

/** Até aqui o cadastro oferece botão pronto; além disso o paciente digita a quantidade. */
export const COMMON_DOSES_PER_DAY = 4;

/** 0 = domingo … 6 = sábado, igual ao `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Um horario do dia e quanto se toma nele.
 *
 * `amount: null` e "o mesmo de sempre", o `doseAmount` da prescricao: repetir o numero em cada
 * horario criaria varios lugares onde a verdade pode divergir. Preenchido, vale so para este
 * horario, e e o que permite insulina 10 UI de manha e 8 UI a noite num cadastro so.
 */
export type ScheduledDose = {
  at: TimeOfDay;
  amount: number | null;
};

/**
 * As quatro formas de posologia que o app aceita.
 *
 * As tres que agendam respondem a mesma pergunta, em quais dias, e os horarios sao um eixo
 * separado. Foi essa separacao que eliminou "a cada X horas", que misturava os dois e produzia o
 * mesmo resultado que `daily` com os horarios equivalentes.
 */
export type PosologySchedule =
  /** Todo dia, nos mesmos horários. Ex: 08:00 e 20:00. */
  | { kind: "daily"; doses: ScheduledDose[] }
  /** Só em certos dias da semana. Ex: segunda e quinta às 09:00. */
  | { kind: "weekly"; weekdays: Weekday[]; doses: ScheduledDose[] }
  /**
   * Repete a cada `cycleLengthDays`, tomando nos `activeDays` primeiros.
   *
   * Um mecanismo so para tres coisas que as pessoas dizem diferente: cartela de anticoncepcional,
   * dia sim dia nao, e injecao de 30 em 30 dias.
   *
   * `cycleStartDate` e o primeiro dia do ciclo atual, e nao o do cadastro: quem cadastra no quinto
   * dia da cartela receberia a pausa cinco dias atrasada, sem nada denunciando.
   *
   * Contado em dias, o ciclo escorrega no calendario. E o preco de nao ter uma frequencia mensal
   * separada respondendo a mesma pergunta.
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

/** Receita pode vir da câmera ou de um arquivo já salvo - muda como é aberta pra visualizar. */
export type PrescriptionAttachmentKind = "image" | "document";

/**
 * Recomendações de como tomar, copiadas pelo paciente da bula ou do que o médico disse. São
 * **anotação**: não mudam horário, dose nem lembrete - existem pra aparecer junto da dose na
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
   * O que a lista fechada não cobriu - "diluir em meio copo", "não partir o comprimido".
   * Separado de `notes` porque acompanha a dose na hora de tomar, e não o tratamento.
   */
  intakeNote: string | null;
  /** Observação livre do paciente sobre o tratamento como um todo. */
  notes: string | null;
  /** Receita anexada. Caminho local - nunca URL remota direta, ver `attachmentSyncOptOut`. */
  attachmentUri: string | null;
  attachmentKind: PrescriptionAttachmentKind | null;
  /** Validade da receita em ISO `YYYY-MM-DD` - base do lembrete de renovação. */
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
   * Se a pessoa quer ser avisada sobre esta receita vencer.
   *
   * Sozinho, garante o aviso **no dia do vencimento**. `renewalReminderLeadDays` acrescenta o
   * lembrete antecipado quando ela também escolhe um prazo - e são duas perguntas diferentes:
   * "quero saber" e "quero saber com quanto tempo". Enquanto as duas viviam na mesma coluna,
   * marcar sem escolher prazo produzia silêncio total.
   */
  renewalReminderEnabled: boolean;
  /**
   * LGPD: receita é dado sensível de saúde. Se true, o anexo nunca sobe pro Supabase Storage
   * mesmo com backup habilitado - fica só no aparelho (decisão nº10).
   */
  attachmentSyncOptOut: boolean;
};
