/**
 * Estado interno do app — o que ele precisa lembrar entre execuções e não é dado de saúde.
 *
 * Nasce para o **fuso em que a grade de doses foi gerada** (ver `fuso-da-grade`), mas é uma tabela
 * de chave e valor de propósito: o próximo estado desse tipo não precisa de migration nova. O que
 * entra aqui é sempre pequeno e interno — nunca algo que a pessoa cadastrou.
 *
 * ## Por que uma tabela, e não `AsyncStorage`
 *
 * Pelo mesmo motivo do `sync_state` (migration 016): o que mora no banco some com o banco. O fuso da
 * grade descreve as doses gravadas — apagadas elas, ele não descreve mais nada, e sobreviver ao
 * "apagar tudo" faria o app concluir que a grade de doses que não existe mais está no fuso certo.
 */
export const MIGRATION_019_APP_STATE = `
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

/**
 * O fuso em que a grade de doses foi gerada — ver `regerarGradeSeOFusoMudou`.
 *
 * A chave mora aqui, junto da tabela, e não no módulo que a usa: quem escreve o valor
 * (`fuso-da-grade`, em `notifications/`) e quem o apaga (`LocalDataRepository`, em `data/`) são
 * camadas diferentes, e nenhuma delas deve importar da outra só para concordar sobre um literal.
 */
export const CHAVE_DO_FUSO_DA_GRADE = "fuso-da-grade";
