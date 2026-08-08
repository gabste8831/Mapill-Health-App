import * as Crypto from "expo-crypto";

import type { InventoryAdjustment } from "../entities/inventory-item";
import type { IntakeLog, IntakeStatus } from "../entities/intake-log";
import type { IntakeLogRepository } from "../ports/intake-log-repository";
import type { InventoryRepository } from "../ports/inventory-repository";

type CorrectIntakeInput = {
  id: string;
  previousLog: IntakeLog;
  medicationId: string;
  newStatus: IntakeStatus;
  occurredAt: string;
};

/** delta que o consumo de UMA dose representa no estoque, por status. */
function consumptionDelta(status: IntakeStatus): number {
  return status === "confirmed" ? -1 : 0;
}

/**
 * Corrige um IntakeLog já registrado (ex: paciente confirma um dia depois que esqueceu de
 * marcar). Nunca sobrescreve o log antigo — grava um novo apontando pra ele via `correctsLogId`
 * — e, se a mudança de status altera o consumo, aplica só a diferença (delta) no estoque, com
 * `reason: "intake_correction"`, preservando auditoria completa de tudo que já foi ajustado.
 */
export class CorrectIntake {
  constructor(
    private readonly intakeLogRepository: IntakeLogRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(input: CorrectIntakeInput): Promise<void> {
    const correctedLog: IntakeLog = {
      id: input.id,
      doseScheduleId: input.previousLog.doseScheduleId,
      status: input.newStatus,
      occurredAt: input.occurredAt,
      correctsLogId: input.previousLog.id,
      updatedAt: input.occurredAt,
      syncedAt: null,
      deletedAt: null,
    };

    await this.intakeLogRepository.save(correctedLog);

    const delta = consumptionDelta(input.newStatus) - consumptionDelta(input.previousLog.status);
    if (delta === 0) return; // ex: só corrigiu o horário, consumo efetivo não mudou

    const item = await this.inventoryRepository.findByMedication(input.medicationId);
    if (!item) return; // sem estoque cadastrado pra esse medicamento ainda

    const adjustment: InventoryAdjustment = {
      id: Crypto.randomUUID(),
      inventoryItemId: item.id,
      delta,
      reason: "intake_correction",
      updatedAt: input.occurredAt,
      syncedAt: null,
      deletedAt: null,
    };

    await this.inventoryRepository.applyAdjustment(adjustment);
  }
}
