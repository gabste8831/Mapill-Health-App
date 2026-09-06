import { useLocalSearchParams, useRouter } from "expo-router";

import { CompromissosScreen } from "@/telas/Compromissos/CompromissosScreen";

export default function CompromissosRoute() {
  const router = useRouter();
  /**
   * Qual compromisso abrir de cara, quando se chega aqui pelo card da Home.
   *
   * Sem isto o card levaria à lista e deixaria a pessoa reencontrar ali o compromisso em que ela
   * acabou de tocar — que é o tipo de passo que faz um atalho não valer a pena.
   */
  const { detalhe } = useLocalSearchParams<{ detalhe?: string }>();

  return (
    <CompromissosScreen
      detalheInicialId={detalhe}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/calendario"))}
    />
  );
}
