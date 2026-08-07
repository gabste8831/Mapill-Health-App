export type SyncableEntity = {
  /** Gerado no cliente (UUID) — nunca autoincrement, pra não colidir em merge entre dispositivos. */
  id: string;
  /** Usado como critério de LWW quando local e remoto divergem. */
  updatedAt: string;
  /** null = ainda não sincronizado. */
  syncedAt: string | null;
  /** Soft delete — histórico preservado (LGPD exige exclusão real, mas em outro momento do fluxo). */
  deletedAt: string | null;
};
