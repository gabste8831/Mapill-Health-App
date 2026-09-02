import notifee from "@notifee/react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useDatabaseReady } from "@/hooks/use-database-ready";
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

    async function lerHorario() {
      const inicial = await notifee.getInitialNotification();
      if (!ativo) return;

      const dados = inicial?.notification.data;
      const scheduledFor = typeof dados?.scheduledFor === "string" ? dados.scheduledFor : null;
      setInstanteIso(scheduledFor ?? new Date().toISOString());
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
         * Fechar a tela cheia é encerrar a **Activity** que o Notifee abriu, e não navegar para
         * trás — não há pilha atrás dela. Sem isso, responder deixaria a tela aberta sobre a tela
         * de bloqueio, com o alarme já resolvido.
         */
        onFechar={() => void notifee.stopForegroundService()}
      />
    </SafeAreaProvider>
  );
}
