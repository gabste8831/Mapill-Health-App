/**
 * Zera a marca d'água do pull, uma vez.
 *
 * Ela guardava o `updated_at` mais alto já recebido, e o pull passou a perguntar por
 * `server_updated_at`, a hora em que a linha chegou à nuvem. As duas não se comparam: a marca antiga
 * é o relógio de quem editou, e usada contra a coluna nova deixaria de fora justamente o que chegou
 * atrasado, que é o defeito que a troca corrige.
 *
 * Sem marca, a próxima sincronização desce tudo uma vez. O que já está igual é descartado pela
 * comparação do LWW, e a marca volta a existir, agora na unidade certa.
 */
export const MIGRATION_021_MARCA_DAGUA_PELA_CHEGADA = `
DELETE FROM sync_state;
`;
