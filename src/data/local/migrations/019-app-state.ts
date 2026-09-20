/**
 * Estado interno do app - o que ele precisa lembrar entre execuções e não é dado de saúde.
 *
 * Tabela de chave e valor de propósito: o próximo estado desse tipo não precisa de migration nova.
 * O que entra aqui é sempre pequeno e interno - nunca algo que a pessoa cadastrou.
 *
 * Nasceu em 13/09 para guardar o fuso em que a grade de doses tinha sido gerada, numa tentativa de
 * manter a **hora de parede** ao trocar de fuso. Essa tentativa foi abandonada (ver a decisão em
 * `docs/O-QUE-FALTA-TESTAR.md`): a dose acontece no **instante** marcado, e viajar não o move.
 *
 * A tabela fica. Migration publicada não se remove - bancos já a criaram, e o `user_version` não
 * volta atrás -, e um lugar para estado interno é útil de qualquer forma.
 *
 * ## Por que uma tabela, e não `AsyncStorage`
 *
 * Pelo mesmo motivo do `sync_state` (migration 016): o que mora no banco some com o banco. Estado
 * que descreve dados apagados não deve sobreviver ao "apagar tudo" - mantido, o app concluiria
 * coisas sobre um banco que não existe mais.
 */
export const MIGRATION_019_APP_STATE = `
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

/**
 * A chave onde o fuso da grade foi guardado até 13/09, mantida **só para a limpeza**.
 *
 * A funcionalidade saiu, mas os aparelhos que rodaram aquela versão têm a linha gravada. O
 * apagamento de dados continua removendo-a (ver `LocalDataRepository.eraseTables`) para não deixar
 * lixo de uma feature que não existe mais.
 *
 * Nada escreve nesta chave hoje. Quando não houver mais instalações vindas daquele intervalo, ela
 * pode sair junto com a linha de limpeza.
 */
export const CHAVE_DO_FUSO_DA_GRADE = "fuso-da-grade";
