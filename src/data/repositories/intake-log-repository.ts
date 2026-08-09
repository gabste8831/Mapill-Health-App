import type { IntakeLog, IntakeStatus } from "../../domain/entities/intake-log";
import type { IntakeLogRepository as IntakeLogRepositoryPort } from "../../domain/ports/intake-log-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type IntakeLogRow = SyncableRow & {
  dose_schedule_id: string;
  status: string;
  occurred_at: string;
  corrects_log_id: string | null;
};

export class IntakeLogRepository
  extends SqliteRepository<IntakeLog, IntakeLogRow>
  implements IntakeLogRepositoryPort
{
  protected readonly tableName = "intake_logs";

  protected toEntity(row: IntakeLogRow): IntakeLog {
    return {
      id: row.id,
      doseScheduleId: row.dose_schedule_id,
      status: row.status as IntakeStatus,
      occurredAt: row.occurred_at,
      correctsLogId: row.corrects_log_id,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: IntakeLog): IntakeLogRow {
    return {
      id: entity.id,
      dose_schedule_id: entity.doseScheduleId,
      status: entity.status,
      occurred_at: entity.occurredAt,
      corrects_log_id: entity.correctsLogId,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findByDoseSchedule(doseScheduleId: string): Promise<IntakeLog[]> {
    const rows = await this.database.getAllAsync<IntakeLogRow>(
      `SELECT * FROM ${this.tableName} WHERE dose_schedule_id = ? AND deleted_at IS NULL
       ORDER BY updated_at ASC`,
      [doseScheduleId],
    );
    return rows.map((row) => this.toEntity(row));
  }
}
