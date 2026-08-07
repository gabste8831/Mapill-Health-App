import type { SyncableEntity } from "./syncable";

export type IntakeStatus = "confirmed" | "skipped";

/** Append-only: correção de um log errado é um novo registro, nunca um update. */
export type IntakeLog = SyncableEntity & {
  doseScheduleId: string;
  status: IntakeStatus;
  /** Pode divergir do scheduledFor do agendamento (usuário confirma atrasado, por exemplo). */
  occurredAt: string;
};
