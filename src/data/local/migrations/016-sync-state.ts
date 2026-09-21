/**
 * A marca d'agua do pull.
 *
 * Nasce aqui, e nao em tempo de execucao: um `CREATE TABLE IF NOT EXISTS` a cada sincronizacao
 * parece inofensivo, mas alterar schema exige lock exclusivo do banco inteiro, e nem o WAL o
 * dispensa. Na primeira abertura isso caia sobre a importacao da CMED e dava `database is locked`.
 *
 * Tabela, e nao `AsyncStorage`: o que mora no banco some com o banco, e a marca precisa ser apagada
 * junto no "apagar tudo", senao o app concluiria ter baixado dados que nao tem mais.
 */
export const MIGRATION_016_SYNC_STATE = `
CREATE TABLE IF NOT EXISTS sync_state (
  table_name TEXT PRIMARY KEY NOT NULL,
  last_pulled_at TEXT
);
`;
