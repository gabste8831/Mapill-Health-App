import * as Crypto from "expo-crypto";

import type { InventoryAdjustment } from "../entities/inventory-item";
import type { IntakeLog, IntakeStatus } from "../entities/intake-log";
import type { IntakeLogRepository } from "../ports/intake-log-repository";
import type { InventoryRepository } from "../ports/inventory-repository";

type RegisterIntakeInput = {
  id: string;
  doseScheduleId: string;
  medicationId: string;
  status: IntakeStatus;
  occurredAt: string;
};

/** Confirma (ou marca como pulada) uma dose e, se confirmada, decrementa o estoque. */
export class RegisterIntake {
  constructor(
    private readonly intakeLogRepository: IntakeLogRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async execute(input: RegisterIntakeInput): Promise<void> {
    const log: IntakeLog = {
      id: input.id,
      doseScheduleId: input.doseScheduleId,
      status: input.status,
      occurredAt: input.occurredAt,
      correctsLogId: null,
      updatedAt: input.occurredAt,
      syncedAt: null,
      deletedAt: null,
    };

    await this.intakeLogRepository.save(log);

    if (input.status !== "confirmed") return;

    const item = await this.inventoryRepository.findByMedication(input.medicationId);
    if (!item) return; // sem estoque cadastrado pra esse medicamento ainda

    const adjustment: InventoryAdjustment = {
      id: Crypto.randomUUID(),
      inventoryItemId: item.id,
      delta: -1,
      reason: "intake_consumption",
      updatedAt: input.occurredAt,
      syncedAt: null,
      deletedAt: null,
    };

    await this.inventoryRepository.applyAdjustment(adjustment);
  }
}
