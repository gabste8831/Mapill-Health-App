import type { DoseSchedule } from "../entities/dose-schedule";
import type {
  PosologySchedule,
  Prescription,
  TimeOfDay,
  Weekday,
} from "../entities/prescription";
import type { SyncableEntity } from "../entities/syncable";

/** Horário a agendar. `id` e metadados de sincronização são da camada de dados, não da regra. */
export type DoseScheduleDraft = Omit<DoseSchedule, keyof SyncableEntity>;

/**
 * Só o que a regra realmente lê. Deixa a prescrição inteira passar, e um rascunho também.
 *
 * `doseUnit` não é usado aqui — entra porque `estimateStockDepletion` percorre estas mesmas doses
 * e precisa recusar a conta quando o estoque está em outra unidade.
 */
export type SchedulablePrescription = Pick<
  Prescription,
  "id" | "schedule" | "startDate" | "endDate" | "doseAmount" | "doseUnit"
>;

export type GenerateDoseSchedulesInput = {
  prescription: SchedulablePrescription;
  /** Início da janela a gerar, inclusivo. */
  from: Date;
  /** Fim da janela, exclusivo. Agendar até o infinito não cabe em banco nem em alarme do OS. */
  until: Date;
};

const MINUTES_IN_DAY = 24 * 60;

/** `"08:30"` → 510 minutos desde a meia-noite. `null` se o formato não for `HH:MM` válido. */
function toMinutesOfDay(time: TimeOfDay): number | null {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/** `YYYY-MM-DD` → data local à meia-noite. Evita o deslocamento de fuso do `new Date("...")`. */
function parseIsoDate(isoDate: string): Date | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Um instante agendado e quanto se toma nele — a dose já resolvida, sem `null`. */
type Occurrence = { at: Date; amount: number };

/** Só os dias em que este schedule tem dose. `weekday` é 0–6, igual ao `Date.getDay()`. */
function ehDiaDeTomar(schedule: PosologySchedule, day: Date): boolean {
  if (schedule.kind === "weekly") return schedule.weekdays.includes(day.getDay() as Weekday);
  if (schedule.kind !== "cycle") return true;

  const cycleStart = parseIsoDate(schedule.cycleStartDate);
  if (cycleStart === null || schedule.activeDays < 1) return false;
  if (schedule.activeDays > schedule.cycleLengthDays) return false;

  // O resto fica negativo se o dia vier antes do início do ciclo (tratamento cadastrado com o
  // ciclo começando amanhã); o `+ cycleLengthDays` devolve pro intervalo positivo.
  const desdeOInicio = daysBetween(cycleStart, day);
  const dayInCycle =
    ((desdeOInicio % schedule.cycleLengthDays) + schedule.cycleLengthDays) %
    schedule.cycleLengthDays;
  return dayInCycle < schedule.activeDays;
}

/** Dias inteiros entre duas meia-noites. Positivo quando `day` vem depois de `origin`. */
function daysBetween(origin: Date, day: Date): number {
  return Math.round((day.getTime() - origin.getTime()) / (MINUTES_IN_DAY * 60_000));
}

/** Todos os instantes de um schedule dentro da janela, ainda sem filtrar por vigência. */
function occurrencesInWindow(
  schedule: PosologySchedule,
  from: Date,
  until: Date,
  defaultAmount: number,
): Occurrence[] {
  if (schedule.kind === "asNeeded") return [];

  const doses = schedule.doses
    .map((dose) => ({ minutes: toMinutesOfDay(dose.at), amount: dose.amount ?? defaultAmount }))
    .filter((dose): dose is { minutes: number; amount: number } => dose.minutes !== null);
  if (doses.length === 0) return [];

  const occurrences: Occurrence[] = [];
  for (let day = atMidnight(from); day < until; day = addMinutes(day, MINUTES_IN_DAY)) {
    if (!ehDiaDeTomar(schedule, day)) continue;
    for (const dose of doses) {
      const at = addMinutes(day, dose.minutes);
      if (at >= from && at < until) occurrences.push({ at, amount: dose.amount });
    }
  }
  return occurrences;
}

/**
 * Deriva os horários de dose de uma prescrição dentro de uma janela. É regra de negócio pura:
 * não conhece banco, notificação nem React — quem persiste e quem agenda no OS são outros.
 *
 * "Se necessário" não gera nada de propósito: o paciente toma quando precisa, e agendar um
 * horário para isso inventaria um compromisso que a prescrição não estabeleceu.
 *
 * A vigência da prescrição (`startDate`/`endDate`) recorta a janela — pedir 30 dias de um
 * tratamento que acaba em 5 devolve só os 5.
 */
export function generateDoseSchedules({
  prescription,
  from,
  until,
}: GenerateDoseSchedulesInput): DoseScheduleDraft[] {
  const startDate = parseIsoDate(prescription.startDate);
  if (startDate === null) return [];

  const windowStart = startDate > from ? startDate : from;
  // `endDate` é o último dia de tratamento, então a janela vai até o fim dele, não até o início.
  const endDate = prescription.endDate === null ? null : parseIsoDate(prescription.endDate);
  const treatmentEnd = endDate === null ? null : addMinutes(endDate, MINUTES_IN_DAY);
  const windowEnd = treatmentEnd !== null && treatmentEnd < until ? treatmentEnd : until;
  if (windowStart >= windowEnd) return [];

  return occurrencesInWindow(
    prescription.schedule,
    windowStart,
    windowEnd,
    prescription.doseAmount,
  ).map((occurrence) => ({
    prescriptionId: prescription.id,
    scheduledFor: occurrence.at.toISOString(),
    amount: occurrence.amount,
    notificationId: null,
    snoozeCount: 0,
  }));
}
