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
import { estaBloqueado } from "@/modules/desbloqueio";
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
/**
 * O que a `MainActivity` passa como `initialProps` — ver
 * `plugins/tela-do-alarme-na-main-activity.js`.
 *
 * O bundle da notificação vem inteiro, do intent que abriu a Activity. Só o `data.scheduledFor`
 * interessa aqui; o resto é o que o Notifee empacota e não nos diz respeito.
 */
type AlarmeRaizProps = {
  notificacaoDoAlarme?: { data?: { scheduledFor?: unknown } };
};

export function AlarmeRaiz({ notificacaoDoAlarme }: AlarmeRaizProps) {
  const bancoPronto = useDatabaseReady();

  /**
   * **Carrega a fonte do app — e é isto que conserta o texto cortado.**
   *
   * ## O defeito
   *
   * Com o app **nos recentes**, a tela azul subia com tudo truncado: "Hora do seu" em vez de "Hora
   * do seu remédio", "Tome" em vez de "Tomei", "Sem" em vez de "Silenciar", e as orientações
   * cortadas no meio ("Depois de", "Junto da"). O conteúdo estava certo — o nome do remédio e a
   * dose apareciam inteiros —, o que faltava era o fim de cada frase.
   *
   * ## A causa, e por que é a mesma da splash
   *
   * Todo o `typography` pede `PlusJakartaSans`, e quem a carrega é o `useFonts` do `_layout.tsx` —
   * dentro da árvore do `expo-router`. Esta Activity monta por `AppRegistry`, fora dela: a família
   * nunca é registrada aqui, o Android cai na fonte do sistema, e as métricas da folha de estilos
   * (lineHeight fixo, letterSpacing negativo) passam a valer para uma fonte mais larga. O texto não
   * cabe e é cortado.
   *
   * É o mesmo padrão do `hideAsync` acima: tudo o que o `_layout` prepara para o app não existe
   * neste segundo ponto de entrada, e precisa ser refeito aqui.
   *
   * ## Por que não espera a fonte para montar
   *
   * O valor de retorno é ignorado de propósito. Um alarme que espera a fonte carregar para mostrar
   * qual remédio tomar é pior que um alarme com a fonte do sistema — e o `_layout` já trata a
   * fonte que **falha** como resolvida, pelo mesmo motivo. A tela sobe na hora e redesenha quando a
   * família chega.
   */
  useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  /**
   * **O horário vem por prop, e é a fonte que não falha.**
   *
   * As três buscas do efeito abaixo dependem de coisas que podem não existir no arranque frio: a
   * notificação inicial, a bandeja, e um evento que o JS pode não ter chegado a ouvir. Com o app
   * fechado, as três vinham vazias e a tela subia só azul — o defeito de 14 e 15/09.
   *
   * Esta prop vem do intent que abriu a Activity, já preenchida na primeira renderização. Quando
   * ela existe, o efeito nem precisa correr atrás de nada.
   */
  const daProp =
    typeof notificacaoDoAlarme?.data?.scheduledFor === "string"
      ? notificacaoDoAlarme.data.scheduledFor
      : null;

  const [instanteIso, setInstanteIso] = useState<string | null>(daProp);

  /**
   * Lê o horário que disparou, do `data` da notificação que abriu esta tela.
   *
   * `getInitialNotification` é o único caminho: o componente nasce do full-screen intent, sem
   * parâmetro de rota e sem props. Se não houver notificação inicial — o que acontece se o sistema
   * remontar a Activity —, cai para o horário atual, que é a melhor aproximação disponível e mantém
   * a tela útil em vez de vazia.
   */
  /**
   * **Anuncia a Activity antes de saber de qual horário ela é** — e essa ordem é a correção.
   *
   * O efeito abaixo é assíncrono: abre o banco, consulta `getInitialNotification` e às vezes varre a
   * bandeja. Só no fim `AlarmeScreen` monta e se registra em `alarme-em-cena`. Durante toda essa
   * espera, `jaEstaEmCena` respondia `false` — e o listener de avisos concluía que não havia tela
   * nenhuma para o horário.
   *
   * Foi o defeito que o Gabriel descreveu em 12/09, com um detalhe que mudou o diagnóstico: o que ele
   * via **não** era a ausência da tela azul, era a tela de "Hora do remédio" no lugar dela. Isso
   * aponta para o caminho do `PRESS` em `escutar-avisos`, que fecha a tela cheia e abre a de horário
   * — e que só age porque a guarda de `jaEstaEmCena` respondia `false` cedo demais.
   *
   * O padrão dos recentes é a assinatura da corrida: app nos recentes, o processo já está de pé e o
   * `PRESS` (que a MIUI entrega sozinha na tela de bloqueio) chega antes da montagem; app fora dos
   * recentes, o processo sobe inteiro primeiro, a Activity ganha, e a tela azul fica.
   *
   * Este efeito roda **antes** do de baixo — a ordem de declaração é a ordem de execução no React —
   * e sem `await` nenhum, então não há janela entre o nascimento da Activity e o anúncio dela.
   */
  useEffect(() => {
    activityDeAlarmeNascendo();
    return () => activityDeAlarmeParouDeNascer();
  }, []);

  /**
   * **A tela sai de cena se subiu por um sticky órfão** — o toque que não devia trazê-la.
   *
   * ## O defeito
   *
   * Com o celular **em uso**, tocar na notificação abria a tela azul. Devia abrir a de "Hora do
   * remédio": decisão de 10/09, e é o que o listener faz com o `PRESS`. Medido às 20:49 de 15/09.
   *
   * A causa é o Notifee postar o `MainComponentEvent` quando a notificação é **exibida**, não
   * quando alguém toca. Com o aparelho em uso o Android rebaixa o full-screen intent para heads-up,
   * ninguém monta a Activity, e o evento fica pendurado. O toque seguinte abre a `MainActivity`,
   * `getMainComponent` consome esse sticky e devolve o componente do alarme.
   *
   * ## Por que a guarda vive aqui, e não na `MainActivity`
   *
   * Porque **nenhuma guarda nativa funciona** — três tentativas de 15/09 mediram isso (ver o
   * comentário de `getMainComponentName` no plugin). O intent é `null` quando o componente é
   * decidido, e o extra que distinguiria os caminhos não sobrevive ao `PendingIntent`.
   *
   * ## A pergunta que funciona, e a que não funcionou
   *
   * A primeira tentativa perguntou **"há alarme na bandeja?"**, e ela nunca dispara: o aviso é
   * `ongoing: true` e continua lá mesmo rebaixado a heads-up. Tocar nele encontra o alarme na
   * bandeja, a guarda conclui "legítimo" e a tela azul fica. Medido em 15/09, no cenário em uso
   * com o app fora dos recentes.
   *
   * A pergunta certa é **"esta tela deveria estar na frente agora?"**, e o app já sabe respondê-la:
   * a tela cheia existe para irromper **sobre o bloqueio**. Com o aparelho destravado o Android
   * rebaixa o full-screen intent justamente porque a pessoa está usando o celular, e o destino do
   * toque é a tela do horário (`escutar-avisos`), que o listener já está abrindo.
   *
   * É a mesma pergunta que `use-dose-notifications` faz antes de abrir a rota, pelo mesmo motivo.
   *
   * `=== false` e não `!`: a resposta tem três estados, e `null` é "não consegui perguntar" — build
   * sem o módulo nativo. Aí a tela **fica**, porque errar para o lado de mostrar o alarme é o lado
   * certo de errar num despertador de remédio.
   *
   * `BackHandler.exitApp()` e não `onFechar`: esta Activity nasceu de um toque cujo destino é a
   * tela do horário, e o listener já a está abrindo. Sair devolve a vez para ela — e aqui não há a
   * task a encerrar, porque o app segue aberto atrás.
   */
  useEffect(() => {
    let vivo = true;
    void estaBloqueado()
      .then((bloqueado) => {
        if (!vivo) return;
        if (bloqueado === false) BackHandler.exitApp();
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * **Esconde a splash nativa — e é isto que tira a tela azul vazia.**
   *
   * ## O defeito
   *
   * A tela azul subia sem remédio nenhum, e **continuava lá depois de desbloquear**. O que se via
   * não era esta tela falhando: era a **splash do Expo** por cima dela, cujo fundo é o mesmo
   * `#196FF3` do tema. Medido em 15/09, com log a cada render:
   *
   * ```
   * 20:36:00.616  Try to add startingWindow STARTING_WINDOW_TYPE_SPLASH_SCREEN
   * 20:36:01.848  Running "alarme-de-dose"
   * 20:36:05.003  AlarmeScreen render: doses:1 pendentes:1 nomes:["Losartana Potássica 50 MG"]
   * ```
   *
   * O React montava certo, com a dose carregada, revalidando a cada três segundos — atrás de uma
   * janela que nunca saiu. Nenhuma linha de remoção da splash no log inteiro.
   *
   * ## Por que acontece só aqui
   *
   * `_layout.tsx` chama `preventAutoHideAsync()` **no topo do módulo**, e o `index.js` importa
   * `expo-router/entry` — então a trava vale em qualquer processo, inclusive neste. Mas quem chama
   * `hideAsync()` é o `SplashOverlay`, que vive dentro da árvore do `expo-router`. Esta Activity
   * monta por `AppRegistry`, fora dela: a splash é impedida de sumir e ninguém a esconde.
   *
   * É o mesmo defeito que os comentários de `_layout.tsx` e `use-database-ready` já descrevem —
   * "o app fica preso no fundo azul da splash" —, chegando pelo caminho que não passa pelo roteador.
   *
   * ## Por que aqui, e sem esperar o banco
   *
   * Sem `await` nenhum e fora de qualquer guarda: o alarme já está tocando, e uma splash sobre o
   * `CenteredLoader` é igual a uma splash sobre a tela pronta — em ambos os casos a pessoa acordou
   * com um fundo azul mudo. `hideAsync` é idempotente e rejeita quando não há splash, daí o
   * `catch` vazio: chamar sem ter o que esconder é normal, não é erro.
   */
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // A prop já resolveu: não há o que procurar, e procurar assim mesmo só abriria espaço para uma
    // das buscas devolver um horário diferente do que abriu esta tela.
    if (daProp !== null) return;

    /**
     * Espera o banco, porque o último recurso consulta a grade de doses.
     *
     * Não custa tempo de tela: `AlarmeRaiz` já renderiza o loader enquanto `bancoPronto` for falso
     * (ver o `return` lá embaixo), então a busca não poderia mostrar nada antes disso de qualquer
     * forma. E o som já está tocando — quem o toca é o serviço, não esta tela.
     */
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

      /**
       * **O horário que o listener anotou na entrega** — a rede contra a tela azul vazia.
       *
       * O caminho do `PRESS` cancela a notificação ao tratar o toque, e as duas buscas acima
       * dependem dela. Medido em aparelho em 14/09: 70 ms entre esta tela montar e a notificação
       * sumir, e a tela subia **só azul**, sem remédio nenhum — exatamente o que o Gabriel
       * descreveu ao tocar no aviso em vez de esperar o alarme irromper.
       *
       * `anotarHorarioEntregue` grava no `DELIVERED`, antes de existir toque para cancelar coisa
       * alguma, então este valor sobrevive ao que as buscas acima perdem.
       */
      const anotado = horarioEntregueMaisRecente();
      if (anotado !== null) {
        setInstanteIso(anotado);
        return;
      }

      // Última saída: o horário atual. A tela abre com a lista vazia, mas os botões de silenciar e
      // sair continuam funcionando — o som para, que é o mínimo que ela deve garantir.
      /**
       * **Último recurso: a dose agendada mais próxima de agora**, e não o instante atual.
       *
       * "Agora" garantia tela vazia — dificilmente existe dose no minuto exato em que o efeito roda,
       * e o alarme costuma chegar alguns segundos depois do horário marcado. A tela subia azul, sem
       * remédio nenhum, que é o pior desfecho possível para quem foi acordado por ela.
       *
       * Uma janela de duas horas para cada lado cobre o alarme que atrasou e o que a pessoa demorou
       * a atender, sem alcançar a dose do turno seguinte. Se nada houver ali, aí sim cai no instante
       * atual — a tela fica vazia, mas silenciar e sair continuam funcionando.
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
         * Fechar a tela cheia é **encerrar a Activity**, e não navegar para trás: não há pilha
         * atrás dela — ela nasceu de uma notificação, por cima da tela de bloqueio.
         *
         * `BackHandler.exitApp()` faz exatamente isso. Não é `stopForegroundService`, que só
         * encerra um serviço em primeiro plano — recurso que este alarme não usa, e chamá-lo
         * deixaria a tela aberta com o alarme já respondido.
         *
         * ## O que isto **não** resolve, e por que não dá para resolver aqui
         *
         * Responder a dose com o aparelho bloqueado deixa o app acessível sem autenticação —
         * medido em 15/09 às 21:10 e 21:21. `finishAndRemoveTask` foi tentado e não muda nada: o
         * Android **já dispensou o keyguard** quando esta Activity subiu com `showWhenLocked` e
         * `turnScreenOn`, e não existe API para reimpô-lo.
         *
         * A causa é estrutural e está no topo de `DesbloqueioModule`: `showWhenLocked` vale para a
         * `MainActivity`, e o `index.js` monta a tela do alarme e o app inteiro no mesmo processo.
         * A permissão de aparecer sobre o bloqueio é, portanto, do app todo.
         *
         * A saída seria uma Activity separada só para o alarme, com o `showWhenLocked` nela e não
         * na `MainActivity`. É refatoração de arquitetura, não ajuste — ver
         * `docs/O-QUE-FALTA-TESTAR.md`.
         */
        onFechar={() => BackHandler.exitApp()}
      />
    </SafeAreaProvider>
  );
}
