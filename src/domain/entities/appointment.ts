import type { SyncableEntity } from "./syncable";

export type AppointmentType = "consulta" | "exame" | "renovacao_receita";

export type Appointment = SyncableEntity & {
  type: AppointmentType;
  scheduledFor: string;
  notes: string | null;
  /** Só relevante para `renovacao_receita` — foto da receita anexada pelo paciente. */
  prescriptionPhotoUri: string | null;
  /** Data até quando a receita anexada é válida (dispara o lembrete de renovação). */
  prescriptionValidUntil: string | null;
  /** LGPD: mesma lógica de opt-out de `PatientProfile.photoSyncOptOut`. */
  photoSyncOptOut: boolean;
};
