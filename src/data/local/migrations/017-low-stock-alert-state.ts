/**
 * A memória do aviso de estoque baixo, para ele não se repetir.
 *
 * `inventory_items.low_stock_alerted_at_quantity` guarda **quanto havia na caixa** quando o aviso
 * foi disparado. `NULL` = nunca avisado.
 *
 * Por que a quantidade e não uma data: ao contrário da receita, cuja validade é fixa, a previsão
 * de estoque é recalculada a cada dose confirmada e a cada recontagem — um aviso preso a data
 * voltaria a disparar toda vez que a estimativa mudasse. Comparar quantidades responde à pergunta
 * certa: **houve reposição desde o último aviso?** Só repor rearma o aviso; consumir mais é a
 * mesma queda que já foi avisada uma vez.
 *
 * Nulável porque `ALTER TABLE ADD COLUMN` não aceita `NOT NULL` sem default em tabela populada —
 * e aqui o nulo é o valor correto para as linhas existentes: nenhuma delas foi avisada, já que o
 * aviso não existia até agora.
 */
export const MIGRATION_017_LOW_STOCK_ALERT_STATE = `
ALTER TABLE inventory_items ADD COLUMN low_stock_alerted_at_quantity REAL;
`;
