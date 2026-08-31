import type { InventoryAdjustment } from "../entities/inventory-item";
import type { IntakeLog, IntakeStatus } from "../entities/intake-log";
import type { IdGenerator } from "../ports/id-generator";
import type { IntakeLogRepository } from "../ports/intake-log-repository";
import type { InventoryRepository } from "../ports/inventory-repository";

type RegisterIntakeInput = {
  id: string;
  doseScheduleId: string;
  medicationId: string;
  status: IntakeStatus;
  occurredAt: string;
  /**
   * Quanto esta dose consome, na unidade do estoque — vem de `DoseSchedule.amount`, e não de um
   * "1" implícito. Desde que a dose passou a variar por horário (migration 012), descontar uma
   * unidade fixa erraria o estoque em todo tratamento que não seja de um comprimido por vez:
   * confirmar 10 UI de insulina baixaria 1.
   */
  amount: number;
};

/** Confirma (ou marca como pulada) uma dose e, se confirmada, decrementa o estoque. */
export class RegisterIntake {
  constructor(
    private readonly intakeLogRepository: IntakeLogRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly gerarId: IdGenerator,
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
      id: this.gerarId(),
      inventoryItemId: item.id,
      delta: -input.amount,
      reason: "intake_consumption",
      updatedAt: input.occurredAt,
      syncedAt: null,
      deletedAt: null,
    };

    await this.inventoryRepository.applyAdjustment(adjustment);
  }
}
