import type { PosologyUnit } from "./medication";
import type { SyncableEntity } from "./syncable";

/**
 * Livre por prescrição, não global — cada tratamento tem sua própria criticidade
 * (ex: insulina pede alarme, suplemento de rotina pode ser só notificação ou nada).
 */
export type ReminderMode = "alarm" | "notification" | "none";

/** Horário do dia em `HH:MM`, 24h. */
export type TimeOfDay = string;

/** 0 = domingo … 6 = sábado, igual ao `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * As quatro formas de posologia que o app aceita. União discriminada porque cada uma precisa
 * de dados diferentes — um único `frequencyMinutes` só conseguia expressar "intervalo", e
 * forçava "todo dia às 8h e 20h" a virar uma aproximação errada.
 */
export type PosologySchedule =
  /** Horários fixos, todo dia. Ex: 08:00 e 20:00. */
  | { kind: "daily"; times: TimeOfDay[] }
  /** De X em X minutos a partir de um horário. Ex: a cada 8h começando 06:00. */
  | { kind: "interval"; everyMinutes: number; firstTime: TimeOfDay }
  /** Horários fixos, só em certos dias. Ex: segunda e quinta às 09:00. */
  | { kind: "weekly"; weekdays: Weekday[]; times: TimeOfDay[] }
  /** Sem horário: o paciente toma quando precisa, e nada é agendado. */
  | { kind: "asNeeded" };

/** Receita pode vir da câmera ou de um arquivo já salvo — muda como é aberta pra visualizar. */
export type PrescriptionAttachmentKind = "image" | "document";

export type Prescription = SyncableEntity & {
  medicationId: string;
  doseAmount: number;
  doseUnit: PosologyUnit;
  schedule: PosologySchedule;
  startDate: string;
  /** null = tratamento contínuo, não "esqueceram de preencher". */
  endDate: string | null;
  reminderMode: ReminderMode;
  /** Observação livre do paciente sobre este tratamento (ex: "tomar em jejum"). */
  notes: string | null;
  /** Receita anexada. Caminho local — nunca URL remota direta, ver `attachmentSyncOptOut`. */
  attachmentUri: string | null;
  attachmentKind: PrescriptionAttachmentKind | null;
  /**
   * LGPD: receita é dado sensível de saúde. Se true, o anexo nunca sobe pro Supabase Storage
   * mesmo com backup habilitado — fica só no aparelho (decisão nº10).
   */
  attachmentSyncOptOut: boolean;
};
