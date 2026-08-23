import type { SyncableEntity } from "./syncable";

/**
 * "deferred" = paciente viu o alarme/notificação e escolheu resolver depois ("ignorar por
 * agora"), distinto de simplesmente nunca ter visto — fica pendente até virar confirmed/skipped.
 */
export type IntakeStatus = "confirmed" | "skipped" | "deferred";

/**
 * Se este status encerra a dose. `deferred` é a exceção que justifica a função existir: ele
 * registra que a pessoa viu e escolheu decidir depois, então a dose continua pendente e volta a
 * aparecer. `null` = ninguém tocou nela ainda.
 */
export function resolvesDose(status: IntakeStatus | null): boolean {
  return status === "confirmed" || status === "skipped";
}

/** Append-only: correção de um log errado é um novo registro, nunca um update. */
export type IntakeLog = SyncableEntity & {
  doseScheduleId: string;
  status: IntakeStatus;
  /** Pode divergir do scheduledFor do agendamento (usuário confirma atrasado, por exemplo). */
  occurredAt: string;
  /**
   * Preenchido quando este log é uma correção retroativa de um log anterior (ex: paciente
   * confirma um dia depois que na verdade tomou). O log antigo nunca é apagado/sobrescrito —
   * isso só marca qual registro este substitui, pra reconstruir o histórico auditável.
   */
  correctsLogId: string | null;
};
