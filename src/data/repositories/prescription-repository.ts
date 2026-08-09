import type { Prescription, ReminderMode } from "../../domain/entities/prescription";
import type { PrescriptionRepository as PrescriptionRepositoryPort } from "../../domain/ports/prescription-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type PrescriptionRow = SyncableRow & {
  medication_id: string;
  dose_amount: number;
  dose_unit: string;
  frequency_minutes: number;
  start_date: string;
  end_date: string | null;
  reminder_mode: string;
};

export class PrescriptionRepository
  extends SqliteRepository<Prescription, PrescriptionRow>
  implements PrescriptionRepositoryPort
{
  protected readonly tableName = "prescriptions";

  protected toEntity(row: PrescriptionRow): Prescription {
    return {
      id: row.id,
      medicationId: row.medication_id,
      doseAmount: row.dose_amount,
      doseUnit: row.dose_unit as Prescription["doseUnit"],
      frequencyMinutes: row.frequency_minutes,
      startDate: row.start_date,
      endDate: row.end_date,
      reminderMode: row.reminder_mode as ReminderMode,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: Prescription): PrescriptionRow {
    return {
      id: entity.id,
      medication_id: entity.medicationId,
      dose_amount: entity.doseAmount,
      dose_unit: entity.doseUnit,
      frequency_minutes: entity.frequencyMinutes,
      start_date: entity.startDate,
      end_date: entity.endDate,
      reminder_mode: entity.reminderMode,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findByMedication(medicationId: string): Promise<Prescription[]> {
    const rows = await this.database.getAllAsync<PrescriptionRow>(
      `SELECT * FROM ${this.tableName} WHERE medication_id = ? AND deleted_at IS NULL`,
      [medicationId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  async findActive(referenceDate: string): Promise<Prescription[]> {
    const rows = await this.database.getAllAsync<PrescriptionRow>(
      `SELECT * FROM ${this.tableName}
       WHERE deleted_at IS NULL AND (end_date IS NULL OR end_date >= ?)`,
      [referenceDate],
    );
    return rows.map((row) => this.toEntity(row));
  }
}
