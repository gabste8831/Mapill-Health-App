import type { InventoryAdjustment, InventoryItem } from "../../domain/entities/inventory-item";
import type { InventoryRepository as InventoryRepositoryPort } from "../../domain/ports/inventory-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type InventoryItemRow = SyncableRow & {
  medication_id: string;
  quantity: number;
  unit: string;
  low_stock_alert_enabled: number;
  low_stock_alert_lead_days: number | null;
  storage_location: string | null;
};

export class InventoryRepository
  extends SqliteRepository<InventoryItem, InventoryItemRow>
  implements InventoryRepositoryPort
{
  protected readonly tableName = "inventory_items";

  protected toEntity(row: InventoryItemRow): InventoryItem {
    return {
      id: row.id,
      medicationId: row.medication_id,
      quantity: row.quantity,
      unit: row.unit,
      lowStockAlertEnabled: row.low_stock_alert_enabled === 1,
      lowStockAlertLeadDays: row.low_stock_alert_lead_days,
      storageLocation: row.storage_location,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: InventoryItem): InventoryItemRow {
    return {
      id: entity.id,
      medication_id: entity.medicationId,
      quantity: entity.quantity,
      unit: entity.unit,
      low_stock_alert_enabled: entity.lowStockAlertEnabled ? 1 : 0,
      low_stock_alert_lead_days: entity.lowStockAlertLeadDays,
      storage_location: entity.storageLocation,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findByMedication(medicationId: string): Promise<InventoryItem | null> {
    const row = await this.database.getFirstAsync<InventoryItemRow>(
      `SELECT * FROM ${this.tableName} WHERE medication_id = ? AND deleted_at IS NULL`,
      [medicationId],
    );
    return row ? this.toEntity(row) : null;
  }

  async applyAdjustment(adjustment: InventoryAdjustment): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      await this.database.runAsync(
        `INSERT INTO inventory_adjustments
           (id, inventory_item_id, delta, reason, updated_at, synced_at, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adjustment.id,
          adjustment.inventoryItemId,
          adjustment.delta,
          adjustment.reason,
          adjustment.updatedAt,
          adjustment.syncedAt,
          adjustment.deletedAt,
        ],
      );

      // Nunca deixa quantity ir a negativo (clamp em zero), conforme contrato do port.
      await this.database.runAsync(
        `UPDATE inventory_items
         SET quantity = MAX(0, quantity + ?), updated_at = ?
         WHERE id = ?`,
        [adjustment.delta, adjustment.updatedAt, adjustment.inventoryItemId],
      );
    });
  }

  /**
   * Quando cada estoque foi **conferido à mão** pela última vez.
   *
   * Só `manual_recount` conta. Baixa por dose e reposição mexem no número sem que ninguém tenha
   * aberto a caixa — e é exatamente a distância entre o número do app e o que está lá dentro que o
   * lembrete de recontagem existe para fechar.
   *
   * Devolve um mapa `inventoryItemId → ISO`. Estoque que nunca foi recontado simplesmente não
   * aparece, e quem chama usa a data de cadastro como marco zero.
   */
  async findLastRecountByItem(): Promise<Map<string, string>> {
    const rows = await this.database.getAllAsync<{ inventory_item_id: string; ultima: string }>(
      `SELECT inventory_item_id, MAX(updated_at) AS ultima
       FROM inventory_adjustments
       WHERE reason = 'manual_recount' AND deleted_at IS NULL
       GROUP BY inventory_item_id`,
    );
    return new Map(rows.map((row) => [row.inventory_item_id, row.ultima]));
  }
}
