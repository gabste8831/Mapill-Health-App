import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `false` enquanto o `.env` não estiver preenchido. Login e backup são opcionais, então o app
 * roda offline-first sem Supabase — mas nada de auth/sync pode ser chamado sem checar isso.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * `null` se as credenciais não estiverem configuradas — quem consome precisa checar
 * `isSupabaseConfigured` antes de usar, nunca assumir que `supabase` existe.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        // AsyncStorage (não expo-secure-store): a sessão do Supabase já é um JWT de vida curta
        // com refresh token — não é um segredo estático como uma senha, e AsyncStorage é o
        // adapter que o supabase-js espera nativamente pra React Native.
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // O app resolve a URL de retorno do OAuth manualmente (ver supabase-auth-gateway.ts),
        // não pela detecção automática do supabase-js, que é pensada pra web.
        detectSessionInUrl: false,
      },
    })
  : null;
