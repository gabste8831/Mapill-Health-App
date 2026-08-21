import type {
  IntakeInstruction,
  PosologySchedule,
  Prescription,
  PrescriptionAttachmentKind,
  ReminderMode,
  Weekday,
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
  /** JSON serializado de `IntakeInstruction[]` — ver migration 011. */
  intake_instructions: string;
  intake_note: string | null;
  notes: string | null;
  attachment_uri: string | null;
  attachment_kind: string | null;
  attachment_valid_until: string | null;
  renewal_reminder_lead_days: number | null;
  attachment_sync_opt_out: number;
};

/** Formas que a coluna `schedule` já teve, e que uma linha gravada ainda pode estar usando. */
type LegacySchedule = {
  kind: string;
  times?: string[];
  doses?: { at: string; amount: number | null }[];
  weekdays?: number[];
  everyMinutes?: number;
  firstTime?: string;
  daysOn?: number;
  daysOff?: number;
  dayInCycleAtStart?: number;
  cycleLengthDays?: number;
  activeDays?: number;
  cycleStartDate?: string;
};

const MINUTES_IN_DAY = 24 * 60;

/** `"08:00"` + 480 → `"16:00"`, dando a volta na meia-noite. */
function somarMinutos(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = (((hours * 60 + mins + minutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const p = (value: number) => String(Math.floor(value)).padStart(2, "0");
  return `${p(total / 60)}:${p(total % 60)}`;
}

function diasDepois(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const alvo = new Date(year, month - 1, day + days);
  const p = (value: number) => String(value).padStart(2, "0");
  return `${alvo.getFullYear()}-${p(alvo.getMonth() + 1)}-${p(alvo.getDate())}`;
}

/**
 * Converte o que está gravado para a forma atual do schedule. Acontece na leitura, e não numa
 * migration, porque reescrever JSON dentro do SQLite não é verificável fora do aparelho — e uma
 * função é. A linha volta pro banco já convertida na próxima gravação.
 *
 * Três formas antigas passam por aqui:
 * - `times: string[]` → `doses`, com `amount: null` (= a dose da prescrição), que é exatamente o
 *   que ela sempre significou, já que dose por horário não existia.
 * - `interval` → os horários equivalentes. Todo intervalo que o app chegou a oferecer divide o
 *   dia por igual, então "a cada 8h desde 06:00" *é* 06:00, 14:00 e 22:00 — a conversão não
 *   aproxima nada. A exceção é 48h, que vira o ciclo de dois dias que ele já era.
 * - `cyclic` com `daysOn`/`daysOff` → `cycle`, com a data de início do ciclo reconstruída a
 *   partir de onde o tratamento caía dentro dele.
 */
function parseSchedule(raw: string, startDate: string): PosologySchedule {
  const parsed = JSON.parse(raw) as LegacySchedule;

  if (parsed.kind === "asNeeded") return { kind: "asNeeded" };

  if (parsed.kind === "interval") {
    const firstTime = parsed.firstTime ?? "";
    const everyMinutes = parsed.everyMinutes ?? 0;
    if (everyMinutes <= 0 || firstTime.length === 0) return { kind: "daily", doses: [] };
    if (everyMinutes > MINUTES_IN_DAY) {
      const cycleLengthDays = Math.round(everyMinutes / MINUTES_IN_DAY);
      return {
        kind: "cycle",
        cycleLengthDays,
        activeDays: 1,
        cycleStartDate: startDate,
        doses: [{ at: firstTime, amount: null }],
      };
    }
    const quantidade = Math.floor(MINUTES_IN_DAY / everyMinutes);
    const doses = Array.from({ length: quantidade }, (_, index) => ({
      at: somarMinutos(firstTime, index * everyMinutes),
      amount: null,
    })).sort((a, b) => a.at.localeCompare(b.at));
    return { kind: "daily", doses };
  }

  // `times` é descartado, e não só ignorado: guardar as duas formas deixaria dois lugares
  // dizendo qual é o horário.
  const doses =
    parsed.doses ?? (parsed.times ?? []).map((at) => ({ at, amount: null as number | null }));

  if (parsed.kind === "weekly") {
    return { kind: "weekly", weekdays: (parsed.weekdays ?? []) as Weekday[], doses };
  }

  if (parsed.kind === "cyclic" || parsed.kind === "cycle") {
    const cycleLengthDays =
      parsed.cycleLengthDays ?? (parsed.daysOn ?? 0) + (parsed.daysOff ?? 0);
    const activeDays = parsed.activeDays ?? parsed.daysOn ?? 0;
    const cycleStartDate =
      parsed.cycleStartDate ?? diasDepois(startDate, -((parsed.dayInCycleAtStart ?? 1) - 1));
    return { kind: "cycle", cycleLengthDays, activeDays, cycleStartDate, doses };
  }

  return { kind: "daily", doses };
}

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
      schedule: parseSchedule(row.schedule, row.start_date),
      startDate: row.start_date,
      endDate: row.end_date,
      reminderMode: row.reminder_mode as ReminderMode,
      intakeInstructions: JSON.parse(row.intake_instructions) as IntakeInstruction[],
      intakeNote: row.intake_note,
      notes: row.notes,
      attachmentUri: row.attachment_uri,
      attachmentKind: row.attachment_kind as PrescriptionAttachmentKind | null,
      attachmentValidUntil: row.attachment_valid_until,
      renewalReminderLeadDays: row.renewal_reminder_lead_days,
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
      intake_instructions: JSON.stringify(entity.intakeInstructions),
      intake_note: entity.intakeNote,
      notes: entity.notes,
      attachment_uri: entity.attachmentUri,
      attachment_kind: entity.attachmentKind,
      attachment_valid_until: entity.attachmentValidUntil,
      renewal_reminder_lead_days: entity.renewalReminderLeadDays,
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
