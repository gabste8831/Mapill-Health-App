import type { SyncableEntity } from "./syncable";

export type PosologyUnit = "mg" | "ml" | "comprimido" | "gota" | "UI";

/**
 * Livre por prescrição, não global — cada tratamento tem sua própria criticidade
 * (ex: insulina pede alarme, suplemento de rotina pode ser só notificação ou nada).
 */
export type ReminderMode = "alarm" | "notification" | "none";

export type Prescription = SyncableEntity & {
  medicationId: string;
  doseAmount: number;
  doseUnit: PosologyUnit;
  /** Intervalo entre doses em minutos (a cada 8h = 480). */
  frequencyMinutes: number;
  startDate: string;
  /** null = tratamento contínuo, não "esqueceram de preencher". */
  endDate: string | null;
  reminderMode: ReminderMode;
};
