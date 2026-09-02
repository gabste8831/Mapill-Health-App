import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
  type AndroidAction,
  type TimestampTrigger,
} from "@notifee/react-native";
import { Linking, Platform } from "react-native";

import type {
  AvisoDeDose,
  NotificationGateway,
  NotificationPermission,
} from "@/domain/ports/notification-gateway";
import { colors } from "@/shared/theme";
import { ACAO_ADIAR, ACAO_TOMEI, MINUTOS_DE_ADIAMENTO } from "./acoes";
import {
  CANAL_ALARME,
  CANAL_LEMBRETE,
  COMPONENTE_DE_ALARME,
  registrarCanais,
} from "./canais-notifee";

/**
 * O agendador de avisos do app — **um só**, para os dois modos que o cadastro promete.
 *
 * ## Por que uma biblioteca, e não duas
 *
 * Entre 01 e 02/09 o app teve as duas: o Notifee para o alarme de tela cheia (a única coisa que o
 * `expo-notifications` não faz) e o `expo-notifications` para todo o resto. Funcionava, e a escrita
 * no banco já era única — as duas chamavam `confirmarDosesDoAviso`, com a mesma guarda contra
 * confirmação repetida.
 *
 * O que não era bom vivia no **cancelamento**. Cada biblioteca só enxerga a própria lista de
 * agendamentos, então a RN14 ("nunca editar, sempre reconstruir") dependia de lembrar de cancelar
 * dos dois lados. Isso é convenção, não construção: um terceiro ponto de cancelamento que
 * esquecesse uma das linhas traria de volta o **alarme órfão** — o pior defeito deste domínio, o
 * lembrete de um remédio que a pessoa já parou de tomar — e nada no compilador denunciaria.
 *
 * Com um agendador só, `cancelarTudo` é literalmente tudo. O defeito deixa de ser possível em vez
 * de ser evitado por disciplina.
 *
 * ## O que se ganha de quebra
 *
 * `onBackgroundEvent` processa a resposta **com o app fechado**. O caminho anterior dependia de
 * `getLastNotificationResponseAsync` no bootstrap, isto é, da pessoa abrir o app para a resposta
 * ser processada. Para um botão "Tomei" que promete não abrir o app, essa diferença é a promessa.
 */

/** O lembrete adiado — o único aviso que **sobrevive** a um reagendamento. Ver `cancelarTudo`. */
export const PREFIXO_ADIADO = "adiado-";

/**
 * Prefixo do alarme de tela cheia, aplicado **aqui** e não no domínio.
 *
 * `planejar-avisos-de-dose` produz a chave do horário (`dose-<instante>`) sem saber que existe tela
 * cheia — ele decide *quando* avisar, não *como*. Marcar o id nesta camada é o que permite ao
 * listener reconhecer um alarme sem que a regra pura conheça o Notifee (§2.6.1).
 */
export const PREFIXO_ALARME = "alarme:";

export function ehAlarmeDeTelaCheia(id: string): boolean {
  return id.startsWith(PREFIXO_ALARME);
}

/** O id do agendamento: a chave do domínio, marcada quando o aviso é um alarme. */
function idDoAviso(aviso: AvisoDeDose): string {
  return aviso.modo === "alarm" ? `${PREFIXO_ALARME}${aviso.chave}` : aviso.chave;
}

/** A chave por trás do id, sem a marca de alarme. */
function chaveDoId(id: string): string {
  return id.startsWith(PREFIXO_ALARME) ? id.slice(PREFIXO_ALARME.length) : id;
}

/** O lembrete adiado, com ou sem prefixo de alarme na frente. */
function ehAdiado(id: string): boolean {
  return chaveDoId(id).startsWith(PREFIXO_ADIADO);
}

/**
 * O que viaja junto da notificação e volta quando ela é tocada.
 *
 * Tudo string: os dados do Notifee são `Record<string, string | number | object>`, e a lista de ids
 * vai serializada para atravessar sem depender de como cada versão do Android preserva arrays.
 */
export type DadosDoAviso = {
  chave: string;
  doseScheduleIds: string[];
  scheduledFor: string;
};

export function lerDadosDoAviso(cru: unknown): DadosDoAviso | null {
  if (typeof cru !== "object" || cru === null) return null;
  const dados = cru as Record<string, unknown>;

  const chave = typeof dados.chave === "string" ? dados.chave : "";
  const scheduledFor = typeof dados.scheduledFor === "string" ? dados.scheduledFor : "";
  if (scheduledFor.length === 0) return null;

  let doseScheduleIds: string[] = [];
  if (typeof dados.doseScheduleIds === "string") {
    try {
      const lista: unknown = JSON.parse(dados.doseScheduleIds);
      if (Array.isArray(lista)) {
        doseScheduleIds = lista.filter((item): item is string => typeof item === "string");
      }
    } catch {
      // Vem do sistema e pode ser de uma versão anterior do app — uma notificação agendada semana
      // passada sobrevive a uma atualização. Ignorar é melhor que derrubar o handler.
      return null;
    }
  }

  return { chave, doseScheduleIds, scheduledFor };
}

let jaPreparado = false;

async function prepararSistema(): Promise<void> {
  if (jaPreparado) return;
  await registrarCanais();
  jaPreparado = true;
}

/**
 * Os botões do aviso.
 *
 * No Notifee eles vão **na notificação**, e não numa categoria registrada antes — o que elimina a
 * indireção que o `expo-notifications` exigia (quatro categorias pré-registradas para cobrir as
 * combinações de "uma ou várias doses" × "pode adiar ou não"). Aqui a combinação é montada na hora.
 *
 * `TOMEI` confirma direto, sem abrir o app: é exceção consciente à confirmação visual que o projeto
 * exige para ações críticas, porque tocar num botão rotulado "Tomei" já é deliberado e a fricção
 * extra custaria justamente o que o app existe para conseguir — doses registradas. O que a torna
 * aceitável é a correção retroativa ser sempre óbvia na Home (RN06).
 */
function acoesDoAviso(aviso: AvisoDeDose): AndroidAction[] | undefined {
  if (aviso.doseScheduleIds.length === 0) return undefined;

  const acoes: AndroidAction[] = [
    {
      // "Tomei todas" com mais de um remédio listado: o rótulo precisa dizer sobre quais ele fala,
      // senão a pessoa confirma duas doses achando que confirmou uma.
      title: aviso.doseScheduleIds.length > 1 ? "Tomei todas" : "Tomei",
      pressAction: { id: ACAO_TOMEI },
    },
  ];

  // Sem adiar: o botão some em vez de aparecer e recusar. Oferecer o que não funciona ensina a
  // desconfiar do que funciona.
  if (!aviso.semAcoesRapidas) {
    acoes.push({
      title: `Adiar ${MINUTOS_DE_ADIAMENTO} min`,
      pressAction: { id: ACAO_ADIAR },
    });
  }

  return acoes;
}

export class NotifeeGateway implements NotificationGateway {
  async consultarPermissao(): Promise<NotificationPermission> {
    const { authorizationStatus } = await notifee.getNotificationSettings();
    if (authorizationStatus === AuthorizationStatus.AUTHORIZED) return "concedida";
    // `NOT_DETERMINED` é ausência de resposta; `DENIED` é recusa, tenha ela vindo do diálogo ou das
    // configurações. A distinção importa: foi confundi-la que fez o card de avisos bloqueados
    // nunca aparecer na Home (bloco 10.1, 01/09).
    if (authorizationStatus === AuthorizationStatus.NOT_DETERMINED) return "naoPedida";
    return "negada";
  }

  async pedirPermissao(): Promise<NotificationPermission> {
    const atual = await this.consultarPermissao();
    // Já decidida: pedir de novo não muda nada e, se negada, o Android nem abre o diálogo.
    // Devolver o estado real é o que permite a tela explicar a saída em vez de insistir.
    if (atual !== "naoPedida") return atual;

    await notifee.requestPermission();
    return this.consultarPermissao();
  }

  async abrirConfiguracoesDoSistema(): Promise<void> {
    await Linking.openSettings();
  }

  /**
   * Abre a tela do Android onde se concede **acesso à política do Não Perturbe**.
   *
   * É permissão especial: o `bypassDnd` do canal só passa a valer depois dela, e o Android **nunca
   * a pede sozinho** — não há diálogo, só esta tela. Sem ela o alarme toca normalmente, mas fica
   * mudo com o Não Perturbe ligado, que é justamente quando ele mais importaria.
   *
   * Tem que ser este intent, e não `openSettings()`: as configurações do app não mostram essa
   * permissão. Ela vive numa lista do sistema, junto de todos os apps que a pedem.
   */
  async abrirAcessoAoNaoPerturbe(): Promise<void> {
    if (Platform.OS !== "android") return;
    await Linking.sendIntent("android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS").catch(
      // Fabricante que não exponha a tela: cair nas configurações do app é melhor que não abrir
      // nada e deixar a pessoa achando que o botão está quebrado.
      () => Linking.openSettings(),
    );
  }

  async agendar(aviso: AvisoDeDose): Promise<void> {
    await prepararSistema();
    if (Platform.OS !== "android") return;

    const ehAlarme = aviso.modo === "alarm";

    const gatilho: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: aviso.quando.getTime(),
      /**
       * `allowWhileIdle` é o que faz o aviso disparar com o aparelho em Doze. Sem isso o Android o
       * adia para a próxima "janela de manutenção", que pode ser meia hora depois — e uma dose
       * lembrada trinta minutos atrasada, em silêncio, é pior que um lembrete que não veio: a
       * pessoa passa a confiar num horário que o app não cumpre.
       */
      alarmManager: { allowWhileIdle: true },
    };

    if (__DEV__) {
      console.log(
        `[Mapill] agendando "${aviso.titulo}" → modo=${aviso.modo} em ${aviso.quando.toLocaleString("pt-BR")}`,
      );
    }

    await notifee.createTriggerNotification(
      {
        id: idDoAviso(aviso),
        title: aviso.titulo,
        body: aviso.corpo,
        data: {
          chave: aviso.chave,
          doseScheduleIds: JSON.stringify(aviso.doseScheduleIds),
          scheduledFor: aviso.quando.toISOString(),
        },
        android: {
          channelId: aviso.modo === "alarm" ? CANAL_ALARME : CANAL_LEMBRETE,
          importance: AndroidImportance.HIGH,
          /**
           * `category: ALARM` diz ao Android que isto **é um despertador**, e não um aviso — é o
           * que autoriza a tela cheia a aparecer. Só no modo `alarm`: dar categoria de alarme a um
           * lembrete de consulta seria pedir para interromper quem não pediu para ser interrompido
           * (RN16).
           */
          ...(ehAlarme ? { category: AndroidCategory.ALARM } : {}),
          /**
           * `notification_icon` é o drawable gerado a partir do `icon` do `app.json`. Sem declarar,
           * o Notifee cai no ícone padrão do sistema e o aviso aparece com cara de "app genérico"
           * no meio dos outros.
           */
          smallIcon: "notification_icon",
          color: colors.primary,
          ...(ehAlarme
            ? {
                // Um alarme de medicação precisa de resposta: sair da bandeja com um deslize é o
                // mesmo que perder a dose.
                autoCancel: false,
                ongoing: true,
                /**
                 * A peça que sustenta a promessa central: abre o componente React registrado em
                 * `index.js` **por cima da tela de bloqueio**, sem passar pelo roteador do app.
                 *
                 * O som contínuo **não é daqui** — notificação nenhuma toca em loop, em biblioteca
                 * nenhuma. Quem toca é a tela, depois de aberta, com `expo-audio`. Foi essa
                 * distinção que faltou no spike original do C1.
                 */
                fullScreenAction: { id: "alarme", mainComponent: COMPONENTE_DE_ALARME },
                pressAction: { id: "alarme", mainComponent: COMPONENTE_DE_ALARME },
                // Acorda a tela: um alarme que dispara com o celular na mesa precisa ser visto.
                lightUpScreen: true,
                // Conteúdo visível na tela de bloqueio: um alarme que aparece como "notificação
                // oculta" obriga a desbloquear para saber que remédio é — e o canal já é PUBLIC,
                // então esconder aqui contrariaria o que ele declara.
                visibility: AndroidVisibility.PUBLIC,
              }
            : {
                // Tocar no corpo abre o app na tela do horário — é onde a resposta parcial cabe.
                pressAction: { id: "default" },
              }),
          actions: acoesDoAviso(aviso),
        },
      },
      gatilho,
    );
  }

  /**
   * Cancela **tudo que será reconstruído**, preservando só o lembrete adiado.
   *
   * A regra é por exclusão, e não por inclusão. Listar o que apagar exigiria lembrar de acrescentar
   * cada tipo novo de aviso (dose, compromisso, receita…), e o preço de esquecer um é o alarme
   * órfão. Esquecer de **preservar** algo custa, no máximo, um lembrete adiado que não volta —
   * recuperável, e visível na hora.
   *
   * Com um agendador só, esta função vê **todos** os agendamentos do app. Era essa a garantia que
   * faltava quando havia duas bibliotecas: cada uma enxergava só a própria lista, e a completude
   * dependia de lembrar de chamar as duas.
   */
  async cancelarTudo(): Promise<void> {
    if (Platform.OS !== "android") return;

    const pendentes = await notifee.getTriggerNotificationIds();
    // O teste ignora o prefixo de alarme: o lembrete adiado é agendado com `modo: "alarm"` (ele
    // precisa interromper como o aviso original), então seu id é `alarme:adiado-…`. Comparar o id
    // cru apagaria justamente o aviso que esta função existe para preservar.
    const alvos = pendentes.filter((id) => !ehAdiado(id));
    if (alvos.length > 0) await notifee.cancelTriggerNotifications(alvos);
  }

  async contarPendentes(): Promise<number> {
    if (Platform.OS !== "android") return 0;
    return (await notifee.getTriggerNotificationIds()).length;
  }

  /**
   * Tira o aviso da bandeja depois de respondido.
   *
   * **No Android ele não sai sozinho** ao tocar num botão de ação — fica lá, e cada toque dispara o
   * handler outra vez. Foi assim que cinco toques em "Adiar" geraram cinco lembretes em 29/08, e o
   * mesmo teria acontecido com "Tomei": cinco ingestões gravadas e cinco doses descontadas.
   *
   * Aqui a busca é pelo **id que nós demos**, e não pelo que o sistema atribuiu. É uma simplificação
   * real em relação ao caminho anterior: no `expo-notifications` o identificador do agendamento e o
   * da notificação exibida eram coisas diferentes, e a dispensa mirava o alvo errado em silêncio.
   */
  async dispensar(chave: string): Promise<void> {
    if (Platform.OS !== "android") return;

    // Quem chama conhece a chave do domínio, não o id do agendamento — e o alarme carrega prefixo.
    // Tentar as duas formas é mais barato que obrigar o chamador a saber qual foi usada.
    await notifee.cancelDisplayedNotification(chave).catch(() => {});
    await notifee.cancelDisplayedNotification(`${PREFIXO_ALARME}${chave}`).catch(() => {});
  }
}

/**
 * Tira da bandeja o alarme que está tocando agora.
 *
 * Separado da dispensa por chave porque a tela de alarme nem sempre sabe qual chave disparou — ela
 * recebe o horário, e o alarme daquele horário é o que precisa sair.
 */
export async function dispensarAlarmeAtivo(): Promise<void> {
  if (Platform.OS !== "android") return;

  /**
   * Tira **só os alarmes**, e não tudo.
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
