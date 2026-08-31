/**
 * O catálogo da CMED — a base pública de medicamentos, importada uma vez na primeira abertura.
 *
 * **Fica fora do modelo sincronizável de propósito.** Não tem `updated_at`, `synced_at` nem
 * `deleted_at`: não é dado do paciente, é dado de referência que vem embutido no app e é igual em
 * todo aparelho. Subir isso para o Supabase (D1) seria replicar 7 mil linhas idênticas por
 * usuário, e apagá-lo no "apagar meus dados" seria destruir o dicionário do app junto com a ficha.
 *
 * `search` é a coluna que a busca usa: nome e princípio ativo juntos, sem acento e em maiúsculas.
 * Guardar isso pronto, em vez de normalizar a cada consulta, é o que faz a busca responder no tempo
 * de uma tecla — o `LIKE` roda sobre texto já preparado.
 */
export const MIGRATION_015_CMED_CATALOG = `
CREATE TABLE IF NOT EXISTS cmed_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  strength TEXT NOT NULL,
  prescription_requirement TEXT NOT NULL,
  search TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cmed_search ON cmed_entries(search);

/*
 * Tabela própria para os EANs, e não uma coluna com vírgulas: um produto tem de 1 a 6 códigos
 * (mesma dosagem, embalagens diferentes), e a leitura do código de barras precisa achar qualquer
 * um deles por igualdade exata. Com string concatenada isso viraria um LIKE, que não usa índice.
 */
CREATE TABLE IF NOT EXISTS cmed_eans (
  ean TEXT PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES cmed_entries(id)
);
`;
