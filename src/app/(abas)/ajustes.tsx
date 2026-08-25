import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { LocalDataRepository } from "@/data/repositories/local-data-repository";
import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { restartFirstRun } from "@/hooks/use-first-run-gate";
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
      // passa a ser o destino da cópia na nuvem quando ela existir (D1).
      const user = await new SupabaseAuthGateway().signInWithGoogle();
      setAccountEmail(user.email);
    } catch (error) {
      Alert.alert("Não foi possível entrar", error instanceof Error ? error.message : "Tente novamente.");
    }
  }

  function handleSignOut() {
    Alert.alert(
      "Desvincular esta conta?",
      "Seus medicamentos, histórico e ficha continuam neste aparelho. Você pode vincular a conta de novo quando quiser.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Desvincular", onPress: () => void desvincular() },
      ],
    );
  }

  async function desvincular() {
    await new SupabaseAuthGateway().signOut();
    setAccountEmail(null);
  }

  /**
   * Apagar é irreversível, então o diálogo diz **o que some e o que fica** — é a distinção que
   * decide se a pessoa toca ou não, e sem ela o medo de perder a ficha faria abandonar a ação que
   * ela realmente queria.
   */
  function handleEraseHealthData() {
    Alert.alert(
      "Apagar seus dados de saúde?",
      "Some: medicamentos, tratamentos, horários, histórico de doses e estoque.\nFica: sua ficha de saúde e o consentimento.\n\nNão há como desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => void executarApagamento("saude") },
      ],
    );
  }

  /**
   * Duas etapas, e não uma. Esta é a ação que devolve o app ao estado de recém-instalado; um toque
   * acidental num item de lista não pode custar a ficha inteira. A segunda etapa existe pra ser
   * lida, então ela repete o que some em vez de só perguntar "tem certeza?".
   */
  function handleEraseEverything() {
    Alert.alert(
      "Apagar tudo e recomeçar?",
      "Some tudo que está neste aparelho: medicamentos, tratamentos, histórico, estoque, sua ficha de saúde, as fotos e as receitas anexadas, e o registro do seu consentimento.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", style: "destructive", onPress: confirmarApagamentoTotal },
      ],
    );
  }

  function confirmarApagamentoTotal() {
    Alert.alert(
      "Tem certeza?",
      "O app volta como recém-instalado e a conta é desvinculada. Sua conta do Google não é excluída — só deixa de estar ligada ao Mapill.\n\nNão há como desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar tudo", style: "destructive", onPress: () => void executarApagamento("tudo") },
      ],
    );
  }

  async function executarApagamento(alcance: "saude" | "tudo") {
    try {
      const localData = new LocalDataRepository();
      if (alcance === "saude") {
        await localData.eraseHealthData();
        Alert.alert("Pronto", "Seus dados de saúde foram apagados deste aparelho.");
        return;
      }

      await localData.eraseEverything();
      // Desvincula depois de apagar: se o apagamento falhar, a pessoa continua com a conta
      // ligada, que é o estado em que ela estava — falhar não pode mudar duas coisas pela metade.
      await desvincular();
      // Sem ficha nem consentimento, nenhuma tela do app tem o que desenhar — e seguir em uso sem
      // consentimento registrado é justamente o que a LGPD não admite.
      restartFirstRun();
    } catch (error) {
      Alert.alert(
        "Não foi possível apagar",
        error instanceof Error ? error.message : "Tente novamente em instantes.",
      );
    }
  }

  const patientName = draft?.fullName.trim() ?? "";

  return (
    <AjustesScreen
      patientName={patientName}
      photoUri={draft?.photoUri ?? null}
      accountEmail={accountEmail}
      googleDisponivel={isSupabaseConfigured}
      // Ajustes é aba: quem chegou pelo atalho da Home tem histórico pra voltar, quem tocou na
      // aba não tem — aí o destino é a Home, que é de onde o atalho existe.
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      onEditProfile={() => router.push("/ficha")}
      onOpenTerms={() => router.push("/termos")}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      onEraseHealthData={handleEraseHealthData}
      onEraseEverything={handleEraseEverything}
    />
  );
}
