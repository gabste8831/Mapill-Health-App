import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

import { quemEstaEmCena } from "@/notifications/alarme-em-cena";

import { AlarmeScreen } from "@/telas/Alarme/AlarmeScreen";

/**
 * A tela do alarme **dentro do app**, para quando ele dispara com o Mapill aberto.
 *
 * ## Por que existe, se já há a tela cheia do Notifee
 *
 * São o mesmo componente por dois caminhos, porque o Android trata os dois casos de forma
 * diferente. Com o aparelho ocioso, o `fullScreenAction` abre a tela por cima do bloqueio, fora do
 * roteador. Com a pessoa **usando** o celular, o sistema rebaixa aquilo para um aviso no topo — e
 * essa decisão não se contorna pela API de notificação.
 *
 * Mas o app rodando tem um recurso que o sistema não controla: ele pode navegar. Então o handler de
 * `DELIVERED` empurra esta rota, e o alarme aparece igual — mesma tela, mesmo som em loop, mesmos
 * botões. É o que mantém a promessa de trazer a atenção de volta para a dose, em vez de um aviso
 * discreto que se ignora sem perceber.
 *
 * Declarada como modal com `gestureEnabled: false` no `_layout`: sair daqui exige responder, como
 * na versão de tela cheia.
 */
export default function AlarmeRoute() {
  const { instante } = useLocalSearchParams<{ instante: string }>();
  const router = useRouter();

  /**
   * **A rota cede lugar à Activity**, se as duas correrem para o mesmo horário.
   *
   * O listener já evita empurrar a rota quando a Activity está em cena (ver `alarme-em-cena`), mas
   * existe uma corrida: o `DELIVERED` pode chegar **antes** de a Activity terminar de montar, e aí
   * a guarda de lá não vê nada e a rota entra. Esta é a outra ponta — se a Activity apareceu no
   * meio, a rota sai.
   *
   * A Activity tem precedência porque é ela que o Android colocou na frente, por cima da tela de
   * bloqueio. A rota é o plano B para quando o sistema rebaixa o full-screen intent, e duas telas
   * tocando o mesmo alarme é o que produzia o som duplicado.
   */
  useEffect(() => {
    if (quemEstaEmCena(instante) !== "activity") return;
    if (router.canGoBack()) router.back();
    else router.replace("/(abas)");
  }, [instante, router]);

  return (
    <AlarmeScreen
      instanteIso={instante}
      /**
       * Aqui **há** pilha atrás: o alarme entrou por cima do que a pessoa estava fazendo. Voltar é
       * o certo — diferente da versão do Notifee, que encerra a Activity porque nasceu sozinha.
       */
      onFechar={() => {
        if (router.canGoBack()) router.back();
        else router.replace("/(abas)");
      }}
    />
  );
}
