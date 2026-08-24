import type { Appointment, AppointmentOutcome } from "../../domain/entities/appointment";
import type { AppointmentRepository as AppointmentRepositoryPort } from "../../domain/ports/appointment-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type AppointmentRow = SyncableRow & {
  title: string;
  scheduled_for: string;
  location: string | null;
  professional: string | null;
  notes: string | null;
  reminder_lead_days: number | null;
  reminder_on_day: number;
  outcome: string | null;
  outcome_notes: string | null;
};

export class AppointmentRepository
  extends SqliteRepository<Appointment, AppointmentRow>
  implements AppointmentRepositoryPort
{
  protected readonly tableName = "appointments";

  protected toEntity(row: AppointmentRow): Appointment {
    return {
      id: row.id,
      title: row.title,
      scheduledFor: row.scheduled_for,
      location: row.location,
      professional: row.professional,
      notes: row.notes,
      reminderLeadDays: row.reminder_lead_days,
      reminderOnDay: row.reminder_on_day === 1,
      outcome: row.outcome === null ? null : (row.outcome as AppointmentOutcome),
      outcomeNotes: row.outcome_notes,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: Appointment): AppointmentRow {
    return {
      id: entity.id,
      title: entity.title,
      scheduled_for: entity.scheduledFor,
      location: entity.location,
      professional: entity.professional,
      notes: entity.notes,
      reminder_lead_days: entity.reminderLeadDays,
      reminder_on_day: entity.reminderOnDay ? 1 : 0,
      outcome: entity.outcome,
      outcome_notes: entity.outcomeNotes,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findAllOrderedByDate(): Promise<Appointment[]> {
    const rows = await this.database.getAllAsync<AppointmentRow>(
      `SELECT * FROM ${this.tableName}
       WHERE deleted_at IS NULL
       ORDER BY scheduled_for ASC`,
    );
    return rows.map((row) => this.toEntity(row));
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
