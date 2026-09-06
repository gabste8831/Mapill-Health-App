/**
 * A marca d'água do pull, que até aqui nascia em tempo de execução.
 *
 * ## O defeito que isto corrige
 *
 * A tabela era criada pelo próprio `sync-service`, com um `CREATE TABLE IF NOT EXISTS` no começo de
 * cada sincronização. Parecia inofensivo — a segunda vez em diante não faz nada —, mas **`CREATE
 * TABLE` altera o schema, e alterar schema exige lock exclusivo do banco inteiro**. Nem o WAL o
 * dispensa: ele separa leitor de escritor, não escritor de escritor.
 *
 * Na primeira abertura isso caía exatamente sobre a importação do catálogo da CMED, que roda em
 * segundo plano. O resultado era `database is locked` em três lugares ao mesmo tempo, e a
 * restauração falhava logo no login — no momento em que a pessoa mais espera ver seus dados.
 *
 * Aqui ela nasce junto com as outras: uma vez, na abertura, antes de qualquer coisa escrever.
 *
 * ## Por que uma tabela, e não `AsyncStorage`
 *
 * A marca precisa ser apagada junto com os dados no "apagar tudo", e o que mora no banco some com o
 * banco. Guardada fora dele, ela sobreviveria ao apagamento e o app concluiria que já baixou dados
 * que não tem mais.
 */
export const MIGRATION_016_SYNC_STATE = `
CREATE TABLE IF NOT EXISTS sync_state (
  table_name TEXT PRIMARY KEY NOT NULL,
  last_pulled_at TEXT
);
`;
