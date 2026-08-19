import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import type { AuthUser } from "../../domain/entities/auth-user";
import type { AuthGateway } from "../../domain/ports/auth-gateway";
import { isSupabaseConfigured, supabase } from "./supabase-client";

// Fecha a aba do navegador automaticamente quando o Google redireciona de volta pro app —
// necessário no fluxo com `expo-web-browser`, ver docs do Supabase para Expo.
WebBrowser.maybeCompleteAuthSession();

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function toAuthUser(user: SupabaseAuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
  };
}

/**
 * `asserts x is T` só é válido sobre parâmetro (ou `this`), não sobre um import de módulo —
 * daí retornar o cliente em vez de tentar estreitar o tipo da variável importada.
 */
function ensureSupabaseConfigured(): NonNullable<typeof supabase> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Login com Google ainda não foi configurado neste app (faltam as credenciais do Supabase no .env).",
    );
  }
  return supabase;
}

/** Implementação real do `AuthGateway` via Supabase Auth (OAuth do Google). */
export class SupabaseAuthGateway implements AuthGateway {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session ? toAuthUser(data.session.user) : null;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const client = ensureSupabaseConfigured();

    // Sem esquema fixo: `makeRedirectUri()` já usa o `scheme` do app.json (`mapillapp`) em
    // builds nativos, e o proxy do Expo Go em desenvolvimento.
    const redirectTo = makeRedirectUri();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) {
      throw error ?? new Error("Não foi possível iniciar o login com Google.");
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) {
      throw new Error("Login cancelado.");
    }

    // O Supabase devolve os tokens no fragmento da URL (depois do #), não na query (?) — troca
    // pra poder ler com URLSearchParams igual.
    const fragment = result.url.split("#")[1] ?? "";
    const params = new URLSearchParams(fragment);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      throw new Error("Resposta de login incompleta — tente novamente.");
    }

    const { data: sessionData, error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError || !sessionData.session) {
      throw sessionError ?? new Error("Não foi possível estabelecer a sessão.");
    }

    return toAuthUser(sessionData.session.user);
  }

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }
}
