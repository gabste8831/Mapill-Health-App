import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { AjustesScreen } from "@/telas/Ajustes/AjustesScreen";

export default function AjustesRoute() {
  const router = useRouter();
  const { draft } = usePatientProfile();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    new SupabaseAuthGateway().getCurrentUser().then((user) => setAccountEmail(user?.email ?? null));
  }, []);

  async function handleSignIn() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        "Login indisponível",
        "O login com Google ainda não foi configurado neste app. Isso não afeta o uso local do Mapill.",
      );
      return;
    }
    try {
      // Entrar depois não toca no SQLite: os dados locais continuam onde estão, e a conta só
      // passa a ser o destino do backup.
      const user = await new SupabaseAuthGateway().signInWithGoogle();
      setAccountEmail(user.email);
    } catch (error) {
      Alert.alert("Não foi possível entrar", error instanceof Error ? error.message : "Tente novamente.");
    }
  }

  async function handleSignOut() {
    await new SupabaseAuthGateway().signOut();
    setAccountEmail(null);
  }

  const patientName = draft?.fullName.trim() ?? "";

  return (
    <AjustesScreen
      patientName={patientName}
      accountEmail={accountEmail}
      onEditProfile={() => router.push("/ficha")}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
    />
  );
}
