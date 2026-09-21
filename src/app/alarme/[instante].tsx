import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

import { quemEstaEmCena } from "@/notifications/alarme-em-cena";

import { AlarmeScreen } from "@/telas/Alarme/AlarmeScreen";

/**
 * A tela do alarme dentro do app, para quando ele dispara com o Mapill aberto.
 *
 * Mesmo componente da tela cheia, por outro caminho: com a pessoa usando o celular, o Android
 * rebaixa o `fullScreenAction` para um aviso no topo, e isso nao se contorna pela API. O app
 * rodando tem um recurso que o sistema nao controla - navegar.
 *
 * Modal com `gestureEnabled: false`: sair daqui exige responder, como na tela cheia.
 */
export default function AlarmeRoute() {
  const { instante } = useLocalSearchParams<{ instante: string }>();
  const router = useRouter();

  /**
   * A rota cede lugar a Activity, se as duas correrem para o mesmo horario.
   *
   * O listener ja evita empurrar a rota com a Activity em cena, mas o `DELIVERED` pode chegar antes
   * de ela montar, e ai a guarda de la nao ve nada. Esta e a outra ponta. A Activity tem
   * precedencia porque e ela que o Android colocou por cima do bloqueio.
   */
  useEffect(() => {
    if (quemEstaEmCena(instante) !== "activity") return;

    /**
     * Navega depois do quadro, e nao dentro do efeito: `router.back()` direto avisa que nao da
     * para atualizar estado de um componente que ainda nao montou, porque a arvore desta rota
     * ainda esta subindo. O `clearTimeout` cobre a tela sair antes do disparo.
     */
    const sair = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/(abas)");
    }, 0);
    return () => clearTimeout(sair);
  }, [instante, router]);

  return (
    <AlarmeScreen
      instanteIso={instante}
      /**
       * Aqui **há** pilha atrás: o alarme entrou por cima do que a pessoa estava fazendo. Voltar é
       * o certo - diferente da versão do Notifee, que encerra a Activity porque nasceu sozinha.
       */
      onFechar={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/(abas)");
      }}
    />
  );
}
