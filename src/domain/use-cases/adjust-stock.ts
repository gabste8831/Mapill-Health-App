import type { InventoryAdjustmentReason } from "../entities/inventory-item";

/** Um evento pronto pra virar `InventoryAdjustment`, sem o id e os campos de sincronização. */
export type StockChange = {
  delta: number;
  reason: InventoryAdjustmentReason;
};

/**
 * Recontagem física: a pessoa abriu a caixa, contou, e diz quanto tem **agora**.
 *
 * O que é gravado é a diferença, nunca o número contado. O estoque do Mapill é a soma dos seus
 * eventos — é isso que faz a correção retroativa de uma dose (`intake_correction`) compor com o
 * resto em vez de brigar com ele. Gravar o valor absoluto quebraria essa soma: duas recontagens
 * concorrentes, ou uma dose confirmada no meio, sobrescreveriam uma à outra em silêncio.
 *
 * `null` quando não há evento a gravar — número inválido, negativo, ou a contagem bateu com o que
 * já estava lá. Recontar e confirmar o mesmo número não é um acontecimento.
 */
export function recountChange(current: number, counted: number): StockChange | null {
  if (!Number.isFinite(counted) || counted < 0) return null;
  const delta = counted - current;
  if (delta === 0) return null;
  return { delta, reason: "manual_recount" };
}

/**
 * Reabastecimento: quanto entrou de novo. Some ao que existe em vez de substituir, porque quem
 * comprou uma caixa não recontou o armário — o que sobrou da anterior continua valendo.
 */
export function restockChange(added: number): StockChange | null {
  if (!Number.isFinite(added) || added <= 0) return null;
  return { delta: added, reason: "restock" };
}
