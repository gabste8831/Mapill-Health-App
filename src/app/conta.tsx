import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { ConsentRepository } from "@/data/repositories/consent-repository";
import { LocalDataRepository } from "@/data/repositories/local-data-repository";
import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { restartFirstRun } from "@/hooks/use-first-run-gate";
import { ContaScreen } from "@/telas/Conta/ContaScreen";
import { CURRENT_TERMS_VERSION } from "@/telas/Consentimento/texto-legal";

export default function ContaRoute() {
  const router = useRouter();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    new SupabaseAuthGateway().getCurrentUser().then((user) => setAccountEmail(user?.email ?? null));
  }, []);

  /**
   * Vincular conta reapresenta os termos antes de entrar (P2). Não é burocracia repetida: é o
   * momento em que a pessoa manifesta intenção de usar a nuvem, e o aceite fica registrado com a
   * data — o "Ler os termos" ao lado existe para que confirmar não seja assinar às cegas.
   */
  function handleSignIn() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        "Login indisponível",
        "O login com Google ainda não foi configurado neste app. Isso não afeta o uso local do Mapill.",
      );
      return;
    }
    Alert.alert(
      "Vincular conta do Google",
      `Ao vincular, você confirma os Termos de Uso e a Política de Privacidade (versão ${CURRENT_TERMS_VERSION}), e o aceite fica registrado com a data de hoje.\n\nSeus dados de saúde continuam apenas neste aparelho — a cópia na nuvem ainda não está disponível.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Ler os termos", onPress: () => router.push("/termos") },
        { text: "Vincular", onPress: () => void entrarComGoogle() },
      ],
    );
  }

  async function entrarComGoogle() {
    try {
      // Entrar depois não toca no SQLite: os dados locais continuam onde estão, e a conta só
      // passa a ser o destino da cópia na nuvem quando ela existir (D1).
      const user = await new SupabaseAuthGateway().signInWithGoogle();
      await registrarAceiteDaVinculacao();
      setAccountEmail(user.email);
    } catch (error) {
      Alert.alert("Não foi possível entrar", error instanceof Error ? error.message : "Tente novamente.");
    }
  }

  /**
   * Grava um novo registro de consentimento a cada vinculação de conta (decisão P2, de 26/08).
   *
   * O login por si só não muda a base legal — o texto vigente diz que os dados não saem do
   * aparelho, e isso continua verdade. O registro existe pelo **rastro**: vincular conta é o
   * momento em que a pessoa manifesta intenção de usar a nuvem, e ter a data disso guardada é o
   * que permite provar depois desde quando ela consentiu com o quê.
   *
   * Registro novo, e não atualização do anterior: consentimento é evento, não estado. Sobrescrever
   * apagaria justamente a linha do tempo que ele existe para preservar.
   *
   * Falhar aqui não desfaz o login — a conta já está vinculada, e derrubar a tela deixaria a
   * pessoa sem saber em que pé ficou.
   */
  async function registrarAceiteDaVinculacao() {
    try {
      const now = new Date().toISOString();
      await new ConsentRepository().save({
        id: Crypto.randomUUID(),
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedAt: now,
        updatedAt: now,
        syncedAt: null,
        deletedAt: null,
      });
    } catch {
      // Sem alerta: o rastro é do app, não uma pendência que a pessoa possa resolver.
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

  return (
    <ContaScreen
      accountEmail={accountEmail}
      googleDisponivel={isSupabaseConfigured}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/ajustes"))}
      onOpenTerms={() => router.push("/termos")}
      onSignIn={handleSignIn}
      onSignOut={handleSignOut}
      onEraseHealthData={handleEraseHealthData}
      onEraseEverything={handleEraseEverything}
    />
  );
}
