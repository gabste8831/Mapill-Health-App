import notifee from "@notifee/react-native";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useDatabaseReady } from "@/hooks/use-database-ready";
import { ehAlarmeDeTelaCheia } from "@/notifications/alarme-em-tela-cheia";
import { CenteredLoader } from "@/ui";
import { AlarmeScreen } from "./AlarmeScreen";

/**
 * A raiz da tela de alarme — o que o Notifee monta quando o alarme dispara.
 *
 * **É um segundo ponto de entrada do app**, e por isso repete coisas que o `_layout.tsx` faz para o
 * resto: abrir o banco e prover o contexto de área segura. Quando este componente sobe, o roteador
 * pode nem existir — o alarme das 8h dispara com o aplicativo fechado desde ontem à noite.
 *
 * O que ele deliberadamente **não** repete é o gate de primeira execução (login, consentimento,
 * ficha). Um alarme só existe se alguém já cadastrou um remédio, o que só é possível depois de
 * passar por tudo aquilo. Repetir o gate aqui seria pedir consentimento às três da manhã a quem já
 * consentiu.
 */
export function AlarmeRaiz() {
  const bancoPronto = useDatabaseReady();
  const [instanteIso, setInstanteIso] = useState<string | null>(null);

  /**
   * Lê o horário que disparou, do `data` da notificação que abriu esta tela.
   *
   * `getInitialNotification` é o único caminho: o componente nasce do full-screen intent, sem
   * parâmetro de rota e sem props. Se não houver notificação inicial — o que acontece se o sistema
   * remontar a Activity —, cai para o horário atual, que é a melhor aproximação disponível e mantém
   * a tela útil em vez de vazia.
   */
  useEffect(() => {
    let ativo = true;

    function usar(dados: Record<string, unknown> | undefined) {
      const scheduledFor = typeof dados?.scheduledFor === "string" ? dados.scheduledFor : null;
      if (scheduledFor !== null) setInstanteIso(scheduledFor);
      return scheduledFor !== null;
    }

    async function lerHorario() {
      const inicial = await notifee.getInitialNotification();
      if (!ativo) return;
      if (usar(inicial?.notification.data)) return;

      /**
       * Sem notificação inicial, procura entre as que estão **na bandeja**.
       *
       * `getInitialNotification` só responde quando a Activity nasceu de um toque. Vindo do
       * `fullScreenAction` com o app já rodando, ou se o sistema remontar a tela, ela volta nula — e
       * cair direto para "agora" abriria um alarme **sem dose nenhuma**, porque dificilmente existe
       * uma agendada para este exato minuto. Uma tela de alarme vazia é pior que nenhuma: ela toca,
       * assusta, e não diz o que tomar.
       *
       * O alarme fica na bandeja (`ongoing: true`), então ele está lá para ser encontrado.
       */
      const naBandeja = await notifee.getDisplayedNotifications();
      if (!ativo) return;

      const doAlarme = naBandeja.find(({ notification }) =>
        typeof notification.id === "string" ? ehAlarmeDeTelaCheia(notification.id) : false,
      );
      if (usar(doAlarme?.notification.data)) return;

      // Última saída: o horário atual. A tela abre com a lista vazia, mas os botões de silenciar e
      // sair continuam funcionando — o som para, que é o mínimo que ela deve garantir.
      setInstanteIso(new Date().toISOString());
    }

    void lerHorario();
    return () => {
      ativo = false;
    };
  }, []);

  if (!bancoPronto || instanteIso === null) return <CenteredLoader />;

  return (
    <SafeAreaProvider>
      <AlarmeScreen
        instanteIso={instanteIso}
        /**
         * Fechar a tela cheia é **encerrar a Activity**, e não navegar para trás: não há pilha
         * atrás dela — ela nasceu de uma notificação, por cima da tela de bloqueio.
         *
         * `BackHandler.exitApp()` faz exatamente isso. Não é `stopForegroundService`, que só
         * encerra um serviço em primeiro plano — recurso que este alarme não usa, e chamá-lo
         * deixaria a tela aberta com o alarme já respondido.
         *
         * "Sair do app" soa drástico, mas aqui é o certo: esta Activity **é** tudo o que está
         * aberto. Quem chegou por ela não tinha o Mapill em uso, e devolver o aparelho ao estado em
         * que estava é o comportamento esperado de um despertador desligado.
         */
        onFechar={() => BackHandler.exitApp()}
      />
    </SafeAreaProvider>
  );
}
