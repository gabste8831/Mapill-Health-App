import type { SyncableEntity } from "./syncable";

export type DoseSchedule = SyncableEntity & {
  prescriptionId: string;
  scheduledFor: string;
  /** id da notificação/alarme local no OS — precisa pra poder cancelar/reagendar depois. */
  notificationId: string | null;
  /**
   * Máximo 1: o alarme toca, o paciente pode adiar uma única vez (5 min), depois disso
   * o sistema não re-toca — fica como "deferred" até o paciente resolver manualmente.
   */
  snoozeCount: 0 | 1;
};
