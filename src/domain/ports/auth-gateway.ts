import type { AuthUser } from "../entities/auth-user";

/**
 * Abstração de autenticação — nenhuma implementação concreta (Supabase, etc.) é importada
 * aqui, seguindo o mesmo princípio dos outros ports (ver `ports/README.md`).
 */
export interface AuthGateway {
  getCurrentUser(): Promise<AuthUser | null>;
  /** Abre o fluxo OAuth do Google e resolve com o usuário autenticado, ou rejeita se cancelado/falhar. */
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
}
