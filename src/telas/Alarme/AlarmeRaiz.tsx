import notifee from "react-native-notify-kit";
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { fecharTelaDoAlarme } from "@/modules/desbloqueio";

import { resolvesDose } from "@/domain/entities/intake-log";
import { useDatabaseReady } from "@/hooks/use-database-ready";
import {
  activityDeAlarmeNascendo,
  activityDeAlarmeParouDeNascer,
  horarioEntregueMaisRecente,
} from "@/notifications/alarme-em-cena";
import { ehAlarmeDeTelaCheia } from "@/notifications/notifee-gateway";
import { CenteredLoader } from "@/ui";
import { AlarmeScreen } from "./AlarmeScreen";

/**
 * A raiz da tela de alarme, montada pelo Notifee quando o alarme dispara.
 *
 * E um segundo ponto de entrada do app, e por isso repete o que o `_layout` faz: abrir o banco,
 * prover area segura, carregar a fonte. Quando ele sobe, o roteador pode nem existir.
 *
 * Nao repete o gate de primeira execucao: um alarme so existe se alguem ja cadastrou um remedio, e
 * pedir consentimento as tres da manha a quem ja consentiu seria absurdo.
 */

/** O bundle do intent que abriu a Activity. So o `data.scheduledFor` interessa. */
type AlarmeRaizProps = {
  notificacaoDoAlarme?: { data?: { scheduledFor?: unknown } };
};

export function AlarmeRaiz({ notificacaoDoAlarme }: AlarmeRaizProps) {
  const bancoPronto = useDatabaseReady();

  /**
   * Carrega a fonte, e e isto que conserta o texto cortado.
   *
   * Todo o `typography` pede PlusJakartaSans, carregada pelo `useFonts` do `_layout`. Esta Activity
   * monta fora daquela arvore, entao a familia nunca era registrada aqui: o Android caia na fonte
   * do sistema e as metricas da folha (lineHeight fixo, letterSpacing negativo) passavam a valer
   * para uma fonte mais larga, cortando o fim de cada frase.
   *
   * O retorno e ignorado de proposito: um alarme que espera a fonte para dizer qual remedio tomar e
   * pior que um alarme com a fonte do sistema.
   */
  useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  /**
   * O horario por prop e a fonte que nao falha.
   *
   * As buscas do efeito abaixo dependem de coisas que podem nao existir no arranque frio: a
   * notificacao inicial, a bandeja, um evento que o JS pode nao ter ouvido. Com o app fechado as
   * tres vinham vazias e a tela subia so azul. A prop vem do intent, ja na primeira renderizacao.
   */
  const daProp =
    typeof notificacaoDoAlarme?.data?.scheduledFor === "string"
      ? notificacaoDoAlarme.data.scheduledFor
      : null;

  const [instanteIso, setInstanteIso] = useState<string | null>(daProp);

  /**
   * Anuncia a Activity antes de saber de qual horario ela e, e essa ordem e a correcao.
   *
   * O efeito abaixo e assincrono, e so no fim `AlarmeScreen` se registra em `alarme-em-cena`.
   * Durante a espera `jaEstaEmCena` respondia `false`, e o `PRESS` que a MIUI entrega sozinha
   * fechava a tela cheia para abrir a do horario no lugar dela.
   *
   * Roda antes do de baixo, porque a ordem de declaracao e a de execucao, e sem `await`: assim nao
   * ha janela entre o nascimento da Activity e o anuncio.
   */
  useEffect(() => {
    activityDeAlarmeNascendo();
    return () => activityDeAlarmeParouDeNascer();
  }, []);

  /**
   * Esconde a splash nativa, e e isto que tira a tela azul vazia.
   *
   * O `_layout` chama `preventAutoHideAsync` no topo do modulo, entao a trava vale em qualquer
   * processo. Mas quem chama `hideAsync` e o `SplashOverlay`, dentro da arvore do roteador: aqui a
   * splash era impedida de sumir e ninguem a escondia, e o seu fundo e o mesmo azul do tema. A tela
   * montava certa por tras de uma janela que nunca saia.
   *
   * Sem esperar o banco: o alarme ja esta tocando, e splash sobre o loader ou sobre a tela pronta e
   * a mesma coisa para quem acordou. `hideAsync` rejeita quando nao ha splash, dai o `catch` vazio.
   */
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // A prop já resolveu: não há o que procurar, e procurar assim mesmo só abriria espaço para uma
    // das buscas devolver um horário diferente do que abriu esta tela.
    if (daProp !== null) return;

    // Espera o banco porque o ultimo recurso consulta a grade. Nao custa tempo de tela: o loader ja
    // esta no ar, e quem toca o som e o servico, nao esta tela.
    if (!bancoPronto) return;

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

      // `getInitialNotification` so responde quando a Activity nasceu de um toque; vindo do
      // `fullScreenAction` ela volta nula. O alarme fica na bandeja como `ongoing`, entao esta la.
      const naBandeja = await notifee.getDisplayedNotifications();
      if (!ativo) return;

      const doAlarme = naBandeja.find(({ notification }) =>
        typeof notification.id === "string" ? ehAlarmeDeTelaCheia(notification.id) : false,
      );
      if (usar(doAlarme?.notification.data)) return;

      // O horario anotado na entrega: o `PRESS` cancela a notificacao de que as duas buscas acima
      // dependem, em ~70ms. Gravado no `DELIVERED`, este valor sobrevive ao que elas perdem.
      const anotado = horarioEntregueMaisRecente();
      if (anotado !== null) {
        setInstanteIso(anotado);
        return;
      }

      /**
       * Ultimo recurso: a dose agendada mais proxima, e nao o instante atual.
       *
       * "Agora" garantia tela vazia, porque dificilmente ha dose no minuto exato em que o efeito
       * roda. Duas horas para cada lado cobrem o alarme que atrasou e o que demorou a ser atendido,
       * sem alcancar o turno seguinte.
       */
      const agora = new Date();
      const duasHoras = 2 * 60 * 60_000;
      const porPerto = await new DoseScheduleRepository()
        .findBetween(
          new Date(agora.getTime() - duasHoras).toISOString(),
          new Date(agora.getTime() + duasHoras).toISOString(),
        )
        .catch(() => []);
      if (!ativo) return;

      const pendente = porPerto
        .filter(({ latestStatus }) => !resolvesDose(latestStatus))
        .sort(
          (a, b) =>
            Math.abs(new Date(a.doseSchedule.scheduledFor).getTime() - agora.getTime()) -
            Math.abs(new Date(b.doseSchedule.scheduledFor).getTime() - agora.getTime()),
        )
        .at(0);

      setInstanteIso(pendente?.doseSchedule.scheduledFor ?? agora.toISOString());
    }

    void lerHorario();
    return () => {
      ativo = false;
    };
  }, [daProp, bancoPronto]);

  if (!bancoPronto || instanteIso === null) return <CenteredLoader />;

  return (
    <SafeAreaProvider>
      <AlarmeScreen
        instanteIso={instanteIso}
        // Esta é a Activity do full-screen intent: perder o primeiro plano aqui significa que outra
        // coisa veio para a frente, e o alarme deve sair de cena junto.
        ehActivityDeAlarme
        /**
         * Fechar e encerrar esta Activity, e nao navegar para tras: ela nasceu de uma notificacao,
         * em task propria, sem pilha atras.
         *
         * `finishAndRemoveTask` e nao `exitApp`, que encerraria o processo inteiro e mataria o app
         * aberto atras junto com o servico que toca o som. E a metade que faltava para responder
         * com o celular bloqueado nao deixar o app acessivel; a outra e o `showWhenLocked` ter
         * saido da `MainActivity`.
         *
         * O `exitApp` fica como ultimo recurso, para a build sem o modulo nativo.
         */
        onFechar={() => {
          void fecharTelaDoAlarme().then((fechou) => {
            if (!fechou) BackHandler.exitApp();
          });
        }}
      />
    </SafeAreaProvider>
  );
}
