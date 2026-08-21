import { generateDoseSchedules, type SchedulablePrescription } from "./generate-dose-schedules";

/** Até onde vale a pena procurar. Estoque que passa disso não é o que o alerta existe pra pegar. */
const HORIZON_DAYS = 730;

export type StockDepletion = {
  /** Dia da última dose que o estoque cobre, ISO `YYYY-MM-DD`. */
  lastDay: string;
  /** Dias de hoje até lá. Zero = o estoque acaba ainda hoje. */
  daysRemaining: number;
  /** Quantas doses ele cobre. Não é `quantidade ÷ dose` quando a dose varia por horário. */
  dosesCovered: number;
};

function toIsoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Quando o estoque acaba, no ritmo da posologia.
 *
 * Percorre as doses de verdade em vez de dividir quantidade pela dose: com dose variando por
 * horário, ou com ciclo que tem dias de pausa, a divisão erra — 10 UI de manhã e 8 à noite
 * consomem 18 por dia, e uma cartela 21/7 não consome nada em sete dias de cada vingada e oito.
 *
 * `null` quando não há o que estimar: sem horário agendado ("só quando precisar"), sem estoque,
 * ou quando ele dura mais que o horizonte de busca.
 */
export function estimateStockDepletion(
  prescription: SchedulablePrescription,
  stockAmount: number,
  from: Date,
): StockDepletion | null {
  if (!Number.isFinite(stockAmount) || stockAmount <= 0) return null;

  const until = new Date(from.getTime() + HORIZON_DAYS * 24 * 60 * 60_000);
  const doses = generateDoseSchedules({ prescription, from, until });
  if (doses.length === 0) return null;

  let restante = stockAmount;
  let ultima: Date | null = null;
  let cobertas = 0;
  for (const dose of doses) {
    if (dose.amount > restante) break;
    restante -= dose.amount;
    ultima = new Date(dose.scheduledFor);
    cobertas += 1;
  }

  // Nenhuma dose cabe: o que sobrou é menos que uma dose, então o estoque já acabou na prática.
  if (ultima === null) return { lastDay: toIsoDay(from), daysRemaining: 0, dosesCovered: 0 };
  // Sobrou estoque depois do horizonte inteiro: dizer uma data aqui seria inventar precisão.
  if (cobertas === doses.length) return null;

  const dias = Math.round(
    (atMidnight(ultima).getTime() - atMidnight(from).getTime()) / (24 * 60 * 60_000),
  );
  return { lastDay: toIsoDay(ultima), daysRemaining: dias, dosesCovered: cobertas };
}
