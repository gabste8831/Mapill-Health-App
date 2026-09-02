import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  type TimestampTrigger,
} from "@notifee/react-native";
import { Platform } from "react-native";

import type { AvisoDeDose } from "@/domain/ports/notification-gateway";
import { colors } from "@/shared/theme";
import { ACAO_TOMEI } from "./acoes";

/**
 * O alarme que **abre uma tela e toca até alguém desligar** — o diferencial do Mapill.
 *
 * ## Por que uma segunda biblioteca de notificação
 *
 * O `expo-notifications` continua responsável por tudo o mais: os lembretes do modo `notification`,
 * os avisos de compromisso e os de receita. Ele só não faz **uma** coisa, e é justamente a que
 * sustenta a promessa central do app — abrir uma tela em cima da tela de bloqueio. A API dele não
 * expõe `fullScreenIntent`, confirmado na doc do SDK 57 e no código nativo do pacote.
 *
 * Foi por isso que o spike do C1 concluiu "inviável" e o projeto entregou o nível B (notificação de
 * alta prioridade). A conclusão estava errada por um motivo específico: tratou limite da
 * **biblioteca** como limite da **plataforma**. O Android permite; o `expo-notifications` é que não
 * oferece. O Notifee oferece, é Apache 2.0, e aceita um componente React em `mainComponent` — então
 * a tela de alarme é escrita em TypeScript, sem uma linha de Kotlin.
 *
 * ## O som contínuo não está aqui
 *
 * Nenhuma notificação toca em loop, em biblioteca nenhuma: o Android toca o som uma vez e para.
 * Quem toca continuamente é a **tela**, depois de aberta, com `expo-audio` em loop. Esta camada só
 * garante que a tela abra — inclusive com o aparelho bloqueado, que é a parte difícil.
 *
 * Essa distinção foi o que faltou no spike original: "som contínuo" foi lido como propriedade da
 * notificação, quando é propriedade de quem ela abre.
 */

/** Canal próprio: separado dos do `expo-notifications` para não disputar id com eles. */
export const CANAL_ALARME_TELA_CHEIA = "dose-fullscreen-alarm-v1";

/**
 * O componente registrado em `index.js` que o Notifee abre em tela cheia.
 *
 * O nome é uma string acordada entre o registro e esta chamada — errar aqui não dá erro de
 * compilação, e o sintoma seria a notificação abrir o app na Home em vez da tela de alarme.
 */
export const COMPONENTE_DE_ALARME = "alarme-de-dose";

/** Prefixo dos ids, para o cancelamento saber o que é dele sem tocar no que é do Expo. */
const PREFIXO = "alarme-tela-cheia:";

export function ehAlarmeDeTelaCheia(id: string): boolean {
  return id.startsWith(PREFIXO);
}

/**
 * Cria o canal do alarme de tela cheia.
 *
 * `sound: "alarme_de_dose"` é o arquivo embarcado, sem extensão — é assim que o Android resolve um
 * recurso de `res/raw`. Aqui a string **é** um nome de arquivo mesmo, ao contrário do
 * `expo-notifications`, onde passar `"default"` fazia procurar um arquivo inexistente e nascia
 * canal mudo.
 */
export async function registrarCanalDeAlarme(): Promise<void> {
  if (Platform.OS !== "android") return;

  /**
   * Se o canal existe **sem** `bypassDnd`, ele é apagado antes de recriar.
   *
   * O canal congela na criação: `createChannel` sobre um id existente atualiza nome e descrição, e
   * mais nada. Quem instalou o app e **depois** autorizou a política do Não Perturbe ficaria com um
   * canal que pediu o bypass e não o tem — para sempre, sem sinal nenhum.
   *
   * Apagar e recriar é a única forma de a autorização passar a valer sem desinstalar o app. Só
   * acontece quando há divergência, então em operação normal isto não faz nada.
   */
  const existente = await notifee.getChannel(CANAL_ALARME_TELA_CHEIA);
  if (existente !== null && !existente.bypassDnd) {
    await notifee.deleteChannel(CANAL_ALARME_TELA_CHEIA);
  }

  await notifee.createChannel({
    id: CANAL_ALARME_TELA_CHEIA,
    name: "Alarme de dose",
    description: "Abre a tela do remédio e toca até você responder.",
    importance: AndroidImportance.HIGH,
    sound: "alarme_de_dose",
    vibration: true,
    vibrationPattern: [500, 500, 500, 500],
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

/**
 * Agenda um alarme que abre a tela cheia no horário.
 *
 * `alarmManager.allowWhileIdle` é o que faz ele disparar com o aparelho em Doze — sem isso o
 * Android adia o alarme para a próxima "janela de manutenção", que pode ser meia hora depois. Uma
 * dose lembrada trinta minutos atrasada, em silêncio, é pior que um lembrete que não veio: a pessoa
 * confia num horário que o app não cumpriu.
 */
export async function agendarAlarmeDeTelaCheia(aviso: AvisoDeDose): Promise<void> {
  if (Platform.OS !== "android") return;

  const gatilho: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: aviso.quando.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id: `${PREFIXO}${aviso.chave}`,
      title: aviso.titulo,
      body: aviso.corpo,
      data: {
        doseScheduleIds: JSON.stringify(aviso.doseScheduleIds),
        scheduledFor: aviso.quando.toISOString(),
      },
      android: {
        channelId: CANAL_ALARME_TELA_CHEIA,
        /**
         * `category: ALARM` e `importance: HIGH` são o que dizem ao Android que isto **é um
         * despertador**, e não um aviso — é o par que autoriza a tela cheia a aparecer.
         */
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        /**
         * **A identidade do app na barra de avisos.**
         *
         * `notification_icon` é o drawable que o plugin do `expo-notifications` gera a partir do
         * `icon` declarado no `app.json` — o mesmo que os outros avisos do Mapill já usam. Sem
         * declarar aqui, o Notifee cai no ícone padrão do sistema, e o alarme apareceria com a
         * cara de "app genérico" no meio dos avisos que têm a marca.
         *
         * A cor é a do app, e ela tinge o ícone na barra de status.
         */
        smallIcon: "notification_icon",
        color: colors.primary,
        // Não sai da bandeja com um deslize: um alarme de medicação precisa de resposta, e dispensar
        // sem querer é o mesmo que perder a dose.
        autoCancel: false,
        ongoing: true,
        /**
         * A peça central. `mainComponent` abre o componente React registrado em `index.js`, **por
         * cima da tela de bloqueio**, sem passar pelo roteador do app.
         */
        fullScreenAction: {
          id: "alarme",
          mainComponent: COMPONENTE_DE_ALARME,
        },
        /**
         * Tocar no **corpo** abre a tela do alarme, e não só o app.
         *
         * Sem `pressAction`, uma notificação do Notifee não faz nada ao ser tocada — nem abre o
         * app. Quem caiu no caminho heads-up ficaria com um aviso que só oferece um botão, sem jeito
         * de ver os detalhes nem de responder dose por dose.
         */
        pressAction: {
          id: "alarme",
          mainComponent: COMPONENTE_DE_ALARME,
        },
        /**
         * As mesmas ações rápidas do modo `notification`, e não é redundância.
         *
         * Quando a pessoa **está usando o celular**, o Android mostra o alarme como heads-up em vez
         * de abrir a tela cheia — é comportamento documentado do `fullScreenAction`, e faz sentido:
         * roubar a tela de quem está no meio de uma ligação seria pior. Nesse caminho, sem estes
         * botões, o aviso viraria um bloco de texto sem saída, e a pessoa teria de abrir o app para
         * fazer o que dois toques resolvem.
         *
         * Os identificadores são os mesmos do `expo-notifications` (`ACAO_TOMEI`), então a resposta
         * cai no mesmo tratamento — a lógica de confirmar dose não é duplicada, só alcançada por
         * outro caminho.
         */
        actions: [
          {
            title: aviso.doseScheduleIds.length > 1 ? "Tomei todas" : "Tomei",
            pressAction: { id: ACAO_TOMEI },
          },
        ],
        // Acorda a tela: um alarme que dispara com o celular na mesa, apagado, precisa ser visto.
        lightUpScreen: true,
      },
    },
    gatilho,
  );
}

/**
 * Cancela **só** os alarmes de tela cheia.
 *
 * O `expo-notifications` e o Notifee mantêm listas separadas, e cada um só enxerga a própria. O
 * reagendamento do C1 é "cancela tudo e agenda tudo de novo" (regra RN14, que garante zero alarme
 * órfão), então esta função é a metade dessa operação que vive deste lado.
 */
export async function cancelarAlarmesDeTelaCheia(): Promise<void> {
  if (Platform.OS !== "android") return;

  const agendados = await notifee.getTriggerNotificationIds();
  const nossos = agendados.filter(ehAlarmeDeTelaCheia);
  if (nossos.length > 0) await notifee.cancelTriggerNotifications(nossos);
}

/**
 * Tira da bandeja o alarme que está tocando agora.
 *
 * Separado do cancelamento de agendados porque são momentos diferentes: um alarme que já disparou
 * não é mais um gatilho pendente, e some da lista de `getTriggerNotificationIds`.
 */
export async function dispensarAlarmeAtivo(): Promise<void> {
  if (Platform.OS !== "android") return;

  /**
   * Tira **só os alarmes** da bandeja, e não tudo.
   *
   * `cancelDisplayedNotifications()` sem argumento apaga todas as notificações do app — inclusive
   * lembretes de outros horários que ainda esperam resposta, e avisos de consulta. Responder um
   * alarme não é motivo para limpar a bandeja inteira: a pessoa perderia avisos que nunca viu.
   */
  const naBandeja = await notifee.getDisplayedNotifications();
  const nossos = naBandeja
    .map(({ notification }) => notification.id)
    .filter((id): id is string => typeof id === "string" && ehAlarmeDeTelaCheia(id));

  if (nossos.length > 0) await notifee.cancelDisplayedNotifications(nossos);
}
