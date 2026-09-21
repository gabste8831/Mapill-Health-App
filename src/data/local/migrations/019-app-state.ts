/**
 * Estado interno do app - o que ele precisa lembrar entre execuções e não é dado de saúde.
 *
 * Tabela de chave e valor de propósito: o próximo estado desse tipo não precisa de migration nova.
 * O que entra aqui é sempre pequeno e interno - nunca algo que a pessoa cadastrou.
 *
 * Nasceu para guardar o fuso em que a grade fora gerada, numa tentativa de manter a hora de parede
 * ao viajar. A tentativa foi abandonada, porque a dose acontece no instante marcado.
 *
 * A tabela fica: migration publicada nao se remove, e um lugar para estado interno e util.
 *
 * Tabela, e nao `AsyncStorage`, pelo mesmo motivo do `sync_state`: estado que descreve dados
 * apagados nao deve sobreviver ao "apagar tudo".
 */
export const MIGRATION_019_APP_STATE = `
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`;

/**
 * A chave onde o fuso da grade foi guardado, mantida so para a limpeza.
 *
 * A funcionalidade saiu, mas os aparelhos que rodaram aquela versão têm a linha gravada. O
 * apagamento de dados continua removendo-a (ver `LocalDataRepository.eraseTables`) para não deixar
 * lixo de uma feature que não existe mais.
 *
 * Nada escreve nesta chave hoje. Quando não houver mais instalações vindas daquele intervalo, ela
 * pode sair junto com a linha de limpeza.
 */
export const CHAVE_DO_FUSO_DA_GRADE = "fuso-da-grade";
