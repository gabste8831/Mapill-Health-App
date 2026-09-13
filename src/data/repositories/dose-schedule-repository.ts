import type { DoseSchedule } from "../../domain/entities/dose-schedule";
import type { IntakeStatus } from "../../domain/entities/intake-log";
import type {
  DoseScheduleRepository as DoseScheduleRepositoryPort,
  DoseScheduleWithStatus,
} from "../../domain/ports/dose-schedule-repository";
import { localDayRangeUtc } from "../../shared/date-input";
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

/**
 * O instante sempre na **mesma forma** — `2026-09-14T02:00:00.000Z`.
 *
 * ## O defeito que isto corrige
 *
 * `scheduled_for` é texto, e chegava em duas formas: o cadastro grava com `toISOString()`, que
 * termina em `Z`, e o que volta da sincronização vem com `+00:00`. As duas descrevem o mesmo
 * momento. O Diagnóstico do Gabriel em 13/09 mostrou as duas lado a lado na mesma lista.
 *
 * Isso quebra **toda comparação de texto** sobre a coluna, e o SQLite só compara texto aqui. Em
 * `deleteUpcoming`, `'...T02:00:00+00:00' >= '...T20:00:00.000Z'` é falso — `+` (0x2B) vem antes de
 * qualquer dígito na tabela ASCII. As doses gravadas com `+00:00` **não eram apagadas**.
 *
 * Foi o que fez a regeração por fuso falhar sem erro nenhum: ela apagava parte da grade, regravava
 * no fuso novo, e as linhas sobreviventes continuavam com o horário antigo. O Gabriel trocou para
 * Manaus e viu as 21:00 virarem 20:00 — que é a conversão de instante absoluto, a marca de uma dose
 * que ninguém regerou.
 *
 * ## Por que na escrita, e não na comparação
 *
 * Corrigir cada consulta seria remendar um sintoma de cada vez, e a próxima comparação escrita
 * esqueceria. Normalizando aqui — o único ponto por onde toda escrita passa — a coluna passa a ter
 * uma forma só, e as comparações de texto voltam a ser válidas por construção.
 *
 * Linhas gravadas antes disto continuam com a forma antiga até serem reescritas. A regeração por
 * fuso e o reabastecimento as reescrevem naturalmente; o `Set` em `reabastecerGradeDeDoses` compara
 * por instante justamente para não duplicá-las nesse meio-tempo.
 */
function normalizarInstante(iso: string): string {
  const data = new Date(iso);
  // Data inválida volta como veio: perder o dado seria pior que guardar uma forma estranha, e quem
  // lê já trata `Invalid Date` (ver a tela de Diagnóstico).
  return Number.isNaN(data.getTime()) ? iso : data.toISOString();
}

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
      scheduled_for: normalizarInstante(entity.scheduledFor),
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
       WHERE ds.deleted_at IS NULL
         AND julianday(ds.scheduled_for) >= julianday(?)
         AND julianday(ds.scheduled_for) < julianday(?)
       ORDER BY julianday(ds.scheduled_for) ASC`,
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

  async findPendingForDay(referenceDate: string): Promise<DoseSchedule[]> {
    // "confirmed"/"skipped" resolvem a dose; "deferred" (ou nenhum log) continua pendente.
    // Dose não resolvida nunca some sozinha — some só por ação do paciente.
    const dia = localDayRangeUtc(referenceDate);
    const rows = await this.database.getAllAsync<DoseScheduleRow>(
      // `julianday` pelo mesmo motivo de `findBetween` e `deleteUpcoming`: a coluna tem dois
      // formatos de ISO gravados, e comparar texto deixa de fora as linhas em `+00:00`. Aqui isso
      // significaria a tela do alarme não achar a dose que acabou de tocar.
      `SELECT ds.* FROM dose_schedules ds
       WHERE ds.deleted_at IS NULL
         AND julianday(ds.scheduled_for) >= julianday(?)
         AND julianday(ds.scheduled_for) < julianday(?)
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
    /**
     * `julianday(...)` compara **instantes**, e não o texto da coluna.
     *
     * A comparação de texto deixava escapar toda linha gravada com `+00:00` em vez de `Z`: o `+`
     * (0x2B) vem antes de qualquer dígito em ASCII, então `'...+00:00' >= '...Z'` é falso mesmo
     * quando o momento é posterior. A regeração por fuso apagava parte da grade, regravava, e as
     * sobreviventes ficavam com o horário antigo — o defeito que o Gabriel viu em 13/09, com as
     * 21:00 virando 20:00 ao trocar para Manaus.
     *
     * `normalizarInstante` no `toRow` impede que a coluna volte a ter duas formas, mas as linhas
     * **já gravadas** continuam como estão até serem reescritas — e é justamente esta consulta que
     * precisa alcançá-las. As duas correções são necessárias: uma para o futuro, outra para o que já
     * existe.
     *
     * `julianday` entende os dois formatos ISO e devolve número, então a comparação passa a ser
     * sobre o instante. O custo é perder o índice da coluna, que aqui não pesa: o `DELETE` já é
     * restrito a uma prescrição.
     */
    await this.database.runAsync(
      `DELETE FROM ${this.tableName}
       WHERE prescription_id = ? AND julianday(scheduled_for) >= julianday(?)`,
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
