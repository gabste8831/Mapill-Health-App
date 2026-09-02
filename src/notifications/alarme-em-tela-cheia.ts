import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  type TimestampTrigger,
} from "@notifee/react-native";
import { Platform } from "react-native";

import type { AvisoDeDose } from "@/domain/ports/notification-gateway";

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
  await notifee.cancelDisplayedNotifications();
}
