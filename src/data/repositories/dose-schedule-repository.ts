import type { DoseSchedule } from "../../domain/entities/dose-schedule";
import type { IntakeStatus } from "../../domain/entities/intake-log";
import type {
  DailyAdherence,
  DoseScheduleRepository as DoseScheduleRepositoryPort,
  DoseScheduleWithStatus,
} from "../../domain/ports/dose-schedule-repository";
import { localDayRangeUtc, toLocalIsoDay } from "../../shared/date-input";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

/** Colunas calculadas que só a consulta da agenda do dia devolve. */
type LatestLogColumns = {
  latest_status: IntakeStatus | null;
  latest_log_id: string | null;
};

type DoseScheduleRow = SyncableRow & {
  prescription_id: string;
  scheduled_for: string;
  amount: number;
  notification_id: string | null;
  snooze_count: number;
};

/** Status resolutivo do log mais recente (por updated_at) de uma dose — ou null se não há log. */
const LATEST_LOG_STATUS_SUBQUERY = `(
  SELECT il.status FROM intake_logs il
  WHERE il.dose_schedule_id = ds.id AND il.deleted_at IS NULL
  ORDER BY il.updated_at DESC LIMIT 1
)`;

export class DoseScheduleRepository
  extends SqliteRepository<DoseSchedule, DoseScheduleRow>
  implements DoseScheduleRepositoryPort
{
  protected readonly tableName = "dose_schedules";

  protected toEntity(row: DoseScheduleRow): DoseSchedule {
    return {
      id: row.id,
      prescriptionId: row.prescription_id,
      scheduledFor: row.scheduled_for,
      amount: row.amount,
      notificationId: row.notification_id,
      snoozeCount: row.snooze_count === 1 ? 1 : 0,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: DoseSchedule): DoseScheduleRow {
    return {
      id: entity.id,
      prescription_id: entity.prescriptionId,
      scheduled_for: entity.scheduledFor,
      amount: entity.amount,
      notification_id: entity.notificationId,
      snooze_count: entity.snoozeCount,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async findByPrescription(prescriptionId: string): Promise<DoseSchedule[]> {
    const rows = await this.database.getAllAsync<DoseScheduleRow>(
      `SELECT * FROM ${this.tableName} WHERE prescription_id = ? AND deleted_at IS NULL`,
      [prescriptionId],
    );
    return rows.map((row) => this.toEntity(row));
  }

  /**
   * As doses de uma faixa de instantes, com o desfecho de cada uma.
   *
   * Faixa de instantes, e não comparação de datas: `scheduled_for` é gravado em UTC e o dia que a
   * tela pergunta é local, então `date(scheduled_for) = date(?)` erra o tamanho do fuso — em
   * Brasília, a dose das 22:00 caía no dia seguinte.
   */
  async findBetween(startTimestamp: string, endTimestamp: string): Promise<DoseScheduleWithStatus[]> {
    // O log mais recente é o que vale: uma correção retroativa grava um registro novo em vez de
    // sobrescrever o antigo, então "o desfecho atual" é sempre o último por `updated_at`.
    const rows = await this.database.getAllAsync<DoseScheduleRow & LatestLogColumns>(
      `SELECT ds.*,
              ${LATEST_LOG_STATUS_SUBQUERY} AS latest_status,
              (
                SELECT il.id FROM intake_logs il
                WHERE il.dose_schedule_id = ds.id AND il.deleted_at IS NULL
                ORDER BY il.updated_at DESC LIMIT 1
              ) AS latest_log_id
       FROM dose_schedules ds
       WHERE ds.deleted_at IS NULL AND ds.scheduled_for >= ? AND ds.scheduled_for < ?
       ORDER BY ds.scheduled_for ASC`,
      [startTimestamp, endTimestamp],
    );

    return rows.map((row) => ({
      doseSchedule: this.toEntity(row),
      latestStatus: row.latest_status,
      latestLogId: row.latest_log_id,
    }));
  }

  async findForDay(referenceDate: string): Promise<DoseScheduleWithStatus[]> {
    const dia = localDayRangeUtc(referenceDate);
    return this.findBetween(dia.start, dia.end);
  }

  async findDailyAdherence(fromDate: string, toDate: string): Promise<DailyAdherence[]> {
    // Agrupar no SQLite exigiria `date(..., 'localtime')`, que depende de o SQLite conhecer o fuso
    // do aparelho. A janela é de dias, então trazer as linhas e agrupar aqui é exato e barato —
    // e usa a mesma regra de dia local do resto do app.
    const rows = await this.database.getAllAsync<{
      scheduled_for: string;
      latest_status: IntakeStatus | null;
    }>(
      `SELECT ds.scheduled_for, ${LATEST_LOG_STATUS_SUBQUERY} AS latest_status
       FROM dose_schedules ds
       WHERE ds.deleted_at IS NULL AND ds.scheduled_for >= ? AND ds.scheduled_for < ?`,
      [localDayRangeUtc(fromDate).start, localDayRangeUtc(toDate).end],
    );

    const porDia = new Map<string, DailyAdherence>();
    for (const row of rows) {
      const dia = toLocalIsoDay(new Date(row.scheduled_for));
      const acumulado = porDia.get(dia) ?? { day: dia, total: 0, confirmed: 0 };
      acumulado.total += 1;
      if (row.latest_status === "confirmed") acumulado.confirmed += 1;
      porDia.set(dia, acumulado);
    }

    return [...porDia.values()].sort((a, b) => a.day.localeCompare(b.day));
  }

  async findPendingForDay(referenceDate: string): Promise<DoseSchedule[]> {
    // "confirmed"/"skipped" resolvem a dose; "deferred" (ou nenhum log) continua pendente.
    // Dose não resolvida nunca some sozinha — some só por ação do paciente.
    const dia = localDayRangeUtc(referenceDate);
    const rows = await this.database.getAllAsync<DoseScheduleRow>(
      `SELECT ds.* FROM dose_schedules ds
       WHERE ds.deleted_at IS NULL
         AND ds.scheduled_for >= ? AND ds.scheduled_for < ?
         AND COALESCE(${LATEST_LOG_STATUS_SUBQUERY}, 'pending') NOT IN ('confirmed', 'skipped')`,
      [dia.start, dia.end],
    );
    return rows.map((row) => this.toEntity(row));
  }

  /**
   * Hard delete de propósito: um horário futuro que deixou de existir porque a posologia mudou
   * não é histórico, é ruído. O soft delete existe pra preservar o que aconteceu — e nada
   * aconteceu nesses.
   */
  async deleteUpcoming(prescriptionId: string, fromTimestamp: string): Promise<void> {
    await this.database.runAsync(
      `DELETE FROM ${this.tableName} WHERE prescription_id = ? AND scheduled_for >= ?`,
      [prescriptionId, fromTimestamp],
    );
  }

  /**
   * Marca o único adiamento permitido. Devolve `true` só quando **este** chamador foi quem o
   * gastou.
   *
   * O `WHERE snooze_count = 0` já impedia o segundo adiamento no banco, mas em silêncio: quem
   * chamava não sabia se tinha conseguido, e seguia agendando o lembrete assim mesmo. Cinco toques
   * em "Adiar" viravam cinco lembretes com um `snooze_count` que nunca passou de 1. Devolver o
   * resultado é o que transforma a trava do banco em trava de comportamento.
   */
  async incrementSnoozeCount(doseScheduleId: string): Promise<boolean> {
    const resultado = await this.database.runAsync(
      `UPDATE ${this.tableName}
       SET snooze_count = 1, updated_at = ?
       WHERE id = ? AND snooze_count = 0`,
      [new Date().toISOString(), doseScheduleId],
    );
    return resultado.changes > 0;
  }
}
