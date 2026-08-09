import type { Appointment, AppointmentType } from "../../domain/entities/appointment";
import type { AppointmentRepository as AppointmentRepositoryPort } from "../../domain/ports/appointment-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type AppointmentRow = SyncableRow & {
  type: string;
  scheduled_for: string;
  notes: string | null;
  prescription_photo_uri: string | null;
  prescription_valid_until: string | null;
  photo_sync_opt_out: number;
};

export class AppointmentRepository
  extends SqliteRepository<Appointment, AppointmentRow>
  implements AppointmentRepositoryPort
{
  protected readonly tableName = "appointments";

  protected toEntity(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      type: row.type as AppointmentType,
      scheduledFor: row.scheduled_for,
      notes: row.notes,
      prescriptionPhotoUri: row.prescription_photo_uri,
      prescriptionValidUntil: row.prescription_valid_until,
      photoSyncOptOut: row.photo_sync_opt_out === 1,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: Appointment): AppointmentRow {
    return {
      id: entity.id,
      type: entity.type,
      scheduled_for: entity.scheduledFor,
      notes: entity.notes,
      prescription_photo_uri: entity.prescriptionPhotoUri,
      prescription_valid_until: entity.prescriptionValidUntil,
      photo_sync_opt_out: entity.photoSyncOptOut ? 1 : 0,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findUpcoming(referenceDate: string): Promise<Appointment[]> {
    const rows = await this.database.getAllAsync<AppointmentRow>(
      `SELECT * FROM ${this.tableName}
       WHERE deleted_at IS NULL AND scheduled_for >= ?
       ORDER BY scheduled_for ASC`,
      [referenceDate],
    );
    return rows.map((row) => this.toEntity(row));
  }
}
