import type { Medication } from "../../domain/entities/medication";
import type { MedicationRepository as MedicationRepositoryPort } from "../../domain/ports/medication-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type MedicationRow = SyncableRow & {
  name: string;
  active_ingredient: string;
  presentation: string;
  ean: string | null;
  from_cmed: number;
};

export class MedicationRepository
  extends SqliteRepository<Medication, MedicationRow>
  implements MedicationRepositoryPort
{
  protected readonly tableName = "medications";

  protected toEntity(row: MedicationRow): Medication {
    return {
      id: row.id,
      name: row.name,
      activeIngredient: row.active_ingredient,
      presentation: row.presentation,
      ean: row.ean,
      fromCmed: row.from_cmed === 1,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: Medication): MedicationRow {
    return {
      id: entity.id,
      name: entity.name,
      active_ingredient: entity.activeIngredient,
      presentation: entity.presentation,
      ean: entity.ean,
      from_cmed: entity.fromCmed ? 1 : 0,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findByEan(ean: string): Promise<Medication | null> {
    const row = await this.database.getFirstAsync<MedicationRow>(
      `SELECT * FROM ${this.tableName} WHERE ean = ? AND deleted_at IS NULL`,
      [ean],
    );
    return row ? this.toEntity(row) : null;
  }
}
