import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { AjustesScreen } from "@/telas/Ajustes/AjustesScreen";

/**
 * Ajustes ficou com o que é de uso corriqueiro: a ficha e o caminho para conta e dados. Vincular,
 * ler os termos e apagar mudaram-se para `/conta` (E4) — são decisões das quais não se volta, e
 * elas ganharam tela própria em vez de dividir espaço com a edição da ficha.
 */
export default function AjustesRoute() {
  const router = useRouter();
  const { draft } = usePatientProfile();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    new SupabaseAuthGateway().getCurrentUser().then((user) => setAccountEmail(user?.email ?? null));
  }, []);

  return (
    <AjustesScreen
      patientName={draft?.fullName.trim() ?? ""}
      photoUri={draft?.photoUri ?? null}
      accountEmail={accountEmail}
      // Ajustes é aba: quem chegou pelo atalho da Home tem histórico pra voltar, quem tocou na
      // aba não tem — aí o destino é a Home, que é de onde o atalho existe.
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      onEditProfile={() => router.push("/ficha")}
      onOpenAccount={() => router.push("/conta")}
      onOpenTheme={() => router.push("/tema")}
    />
  );
}
