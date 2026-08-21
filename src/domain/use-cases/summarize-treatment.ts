import { generateDoseSchedules, type SchedulablePrescription } from "./generate-dose-schedules";

export type TreatmentSummary = {
  /** Dia da primeira dose que ainda vai acontecer, ISO `YYYY-MM-DD`. */
  firstDay: string;
  /** Dia da última dose do tratamento, ISO `YYYY-MM-DD`. */
  lastDay: string;
  /** Quantas doses cabem entre as duas pontas. */
  totalDoses: number;
};

/** Data local de um instante em ISO `YYYY-MM-DD` — `toISOString()` devolveria UTC e erraria o dia. */
function toIsoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * O que o tratamento com prazo realmente é, em doses e não em dias de calendário.
 *
 * Existe por causa de uma ambiguidade que confunde na hora de cadastrar: "por 2 dias" começando
 * hoje termina amanhã, o que só faz sentido se o dia de hoje contar. E ele conta apenas em parte
 * — se todos os horários de hoje já passaram, a primeira dose é amanhã, e o tratamento entrega
 * menos doses do que a conta ingênua "vezes por dia × dias" sugere.
 *
 * Devolver a primeira dose junto com o total é o que permite a tela dizer isso em vez de mostrar
 * só uma data final que a pessoa tem que interpretar sozinha.
 *
 * `null` quando não há nada a resumir: sem fim (uso contínuo), sem horário ("se necessário") ou
 * com a posologia ainda incompleta.
 */
export function summarizeTreatment(
  prescription: SchedulablePrescription,
  from: Date,
): TreatmentSummary | null {
  if (prescription.endDate === null) return null;

  // A vigência já recorta a janela; este limite só existe pra a busca ser finita.
  const until = new Date(from.getFullYear() + 5, 0, 1);
  const doses = generateDoseSchedules({ prescription, from, until });
  if (doses.length === 0) return null;

  return {
    firstDay: toIsoDay(new Date(doses[0].scheduledFor)),
    lastDay: toIsoDay(new Date(doses[doses.length - 1].scheduledFor)),
    totalDoses: doses.length,
  };
}
