import type {
  PosologySchedule,
  Prescription,
  PrescriptionAttachmentKind,
  ReminderMode,
} from "../../domain/entities/prescription";
import type { PrescriptionRepository as PrescriptionRepositoryPort } from "../../domain/ports/prescription-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type PrescriptionRow = SyncableRow & {
  medication_id: string;
  dose_amount: number;
  dose_unit: string;
  /** JSON serializado de `PosologySchedule` — ver migration 008. */
  schedule: string;
  start_date: string;
  end_date: string | null;
  reminder_mode: string;
  notes: string | null;
  attachment_uri: string | null;
  attachment_kind: string | null;
  attachment_sync_opt_out: number;
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
      schedule: JSON.parse(row.schedule) as PosologySchedule,
      startDate: row.start_date,
      endDate: row.end_date,
      reminderMode: row.reminder_mode as ReminderMode,
      notes: row.notes,
      attachmentUri: row.attachment_uri,
      attachmentKind: row.attachment_kind as PrescriptionAttachmentKind | null,
      attachmentSyncOptOut: row.attachment_sync_opt_out === 1,
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
      schedule: JSON.stringify(entity.schedule),
      start_date: entity.startDate,
      end_date: entity.endDate,
      reminder_mode: entity.reminderMode,
      notes: entity.notes,
      attachment_uri: entity.attachmentUri,
      attachment_kind: entity.attachmentKind,
      attachment_sync_opt_out: entity.attachmentSyncOptOut ? 1 : 0,
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
