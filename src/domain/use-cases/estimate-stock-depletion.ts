import type { PosologyUnit } from "../entities/medication";
import { generateDoseSchedules, type SchedulablePrescription } from "./generate-dose-schedules";

/** O estoque como ele é contado: a quantidade e a unidade em que ela foi gravada. */
export type StockOnHand = {
  amount: number;
  unit: PosologyUnit;
};

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
 * Se a vigência do tratamento termina dentro da janela de busca — ou seja, se foi o **fim do
 * tratamento** que interrompeu a geração de doses, e não o horizonte de 730 dias.
 *
 * É o que separa "o estoque dá conta até o último dia do tratamento" (fato, com data) de "o estoque
 * dura mais do que o app projeta" (desconhecido). Sem `endDate` o tratamento é contínuo e nunca
 * acaba antes do horizonte; data mal formada cai no mesmo lugar, porque não dá para afirmar o fim.
 */
function tratamentoAcabaAntesDe(prescription: SchedulablePrescription, until: Date): boolean {
  if (prescription.endDate === null) return false;
  const match = prescription.endDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  // O dia seguinte à meia-noite do último dia: `endDate` é inclusivo, igual em `generateDoseSchedules`.
  const fim = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1);
  return fim < until;
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
 *
 * **Estoque que cobre o tratamento inteiro não é `null`.** Um tratamento com data de fim tem um
 * último dia conhecido, e é ele que a previsão devolve. Até 12/09 os dois casos caíam no mesmo
 * `null` — o que fazia o aviso de estoque desaparecer por completo em qualquer tratamento de
 * duração definida cujo estoque dava conta, enquanto o aviso de receita, que parte de uma data
 * pronta, sempre chegava.
 *
 * **Também `null` quando estoque e dose não são contados na mesma unidade.** Gota se toma em gota
 * e se compra em ml, e converter exigiria a concentração do frasco, que o app não tem. Subtrair
 * "3 gotas" de "20 ml" produz um número que parece uma previsão e não é nenhuma. A unidade entra
 * na assinatura por isso: a checagem já existia no formulário, e as duas outras telas que passaram
 * a chamar esta função esqueceram dela — regra que dá para esquecer é regra que vai ser esquecida.
 */
export function estimateStockDepletion(
  prescription: SchedulablePrescription,
  stock: StockOnHand,
  from: Date,
): StockDepletion | null {
  if (stock.unit !== prescription.doseUnit) return null;
  const stockAmount = stock.amount;
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
  /**
   * Cobriu todas as doses geradas — e aqui há **dois** casos que não podem ser confundidos.
   *
   * O gerador para no menor entre o fim do tratamento e o horizonte de 730 dias. Se ele parou no
   * horizonte, o estoque dura mais do que o app consegue projetar, e dizer uma data seria inventar
   * precisão: `null` é a resposta certa. Era só esse caso que esta linha queria pegar.
   *
   * Mas se ele parou no **fim do tratamento**, a data da última dose é um fato conhecido, e não uma
   * estimativa truncada. Devolvê-la como `null` descartava o estoque inteiro antes de ele chegar ao
   * planejador — e o aviso não saía, nem o da antecedência nem o do dia em que acaba. Um tratamento
   * de 7 dias com 7 comprimidos ficava sem aviso algum, o que o Gabriel encontrou em 12/09 ao
   * comparar com o aviso de receita, que nunca desaparece porque a validade dela já é uma data.
   *
   * O `daysRemaining` que sai daqui é o dia da última dose que o estoque cobre, igual ao dos outros
   * casos. Quem decide o que fazer com ele é `planejarAvisosDeEstoque`.
   */
  if (cobertas === doses.length && !tratamentoAcabaAntesDe(prescription, until)) return null;

  const dias = Math.round(
    (atMidnight(ultima).getTime() - atMidnight(from).getTime()) / (24 * 60 * 60_000),
  );
  return { lastDay: toIsoDay(ultima), daysRemaining: dias, dosesCovered: cobertas };
}
