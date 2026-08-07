import type { SyncableEntity } from "./syncable";

export type DoseSchedule = SyncableEntity & {
  prescriptionId: string;
  scheduledFor: string;
  /** id da notificação local no OS — precisa pra poder cancelar/reagendar depois. */
  notificationId: string | null;
};
