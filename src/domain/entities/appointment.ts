import type { SyncableEntity } from "./syncable";

export type AppointmentType = "consulta" | "renovacao_receita";

export type Appointment = SyncableEntity & {
  type: AppointmentType;
  scheduledFor: string;
  notes: string | null;
};
