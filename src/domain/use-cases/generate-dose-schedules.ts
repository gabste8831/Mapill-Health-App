import type { DoseSchedule } from "../entities/dose-schedule";
import type { PosologySchedule, Prescription, TimeOfDay } from "../entities/prescription";
import type { SyncableEntity } from "../entities/syncable";

/** Horário a agendar. `id` e metadados de sincronização são da camada de dados, não da regra. */
export type DoseScheduleDraft = Omit<DoseSchedule, keyof SyncableEntity>;

/** Só o que a regra realmente lê. Deixa a prescrição inteira passar, e um rascunho também. */
export type SchedulablePrescription = Pick<
  Prescription,
  "id" | "schedule" | "startDate" | "endDate"
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

/** Todos os instantes de um schedule dentro da janela, ainda sem filtrar por vigência. */
function occurrencesInWindow(schedule: PosologySchedule, from: Date, until: Date): Date[] {
  if (schedule.kind === "asNeeded") return [];

  if (schedule.kind === "interval") {
    const firstMinutes = toMinutesOfDay(schedule.firstTime);
    if (firstMinutes === null || schedule.everyMinutes <= 0) return [];

    const occurrences: Date[] = [];
    // Começa no primeiro horário do dia da janela e caminha de intervalo em intervalo. Como o
    // passo é somado ao instante absoluto, a virada de dia sai de graça: 22:00 + 8h = 06:00 do
    // dia seguinte, sem tratamento especial.
    let current = addMinutes(atMidnight(from), firstMinutes);
    while (current < from) current = addMinutes(current, schedule.everyMinutes);
    while (current < until) {
      occurrences.push(current);
      current = addMinutes(current, schedule.everyMinutes);
    }
    return occurrences;
  }

  const times = schedule.times
    .map(toMinutesOfDay)
    .filter((minutes): minutes is number => minutes !== null);
  if (times.length === 0) return [];

  const occurrences: Date[] = [];
  for (let day = atMidnight(from); day < until; day = addMinutes(day, MINUTES_IN_DAY)) {
    if (schedule.kind === "weekly" && !schedule.weekdays.includes(day.getDay() as never)) continue;
    for (const minutes of times) {
      const occurrence = addMinutes(day, minutes);
      if (occurrence >= from && occurrence < until) occurrences.push(occurrence);
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

  return occurrencesInWindow(prescription.schedule, windowStart, windowEnd).map((occurrence) => ({
    prescriptionId: prescription.id,
    scheduledFor: occurrence.toISOString(),
    notificationId: null,
    snoozeCount: 0,
  }));
}
