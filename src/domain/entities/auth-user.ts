/**
 * Usuário autenticado — só o essencial pra exibir na UI (ex: "Olá, {nome}" em Configurações).
 * Não é um `SyncableEntity`: não é um dado do domínio clínico, é a identidade da conta.
 */
export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};
