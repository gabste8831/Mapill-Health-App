import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidForegroundServiceBehavior,
  AndroidForegroundServiceType,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  AndroidVisibility,
  AuthorizationStatus,
  TriggerType,
  type AndroidAction,
  type TimestampTrigger,
} from "react-native-notify-kit";
import { Linking, Platform } from "react-native";

import type {
  AvisoDeDose,
  NotificationGateway,
  NotificationPermission,
} from "@/domain/ports/notification-gateway";
import { colors } from "@/shared/theme";
import { ACAO_PULEI, ACAO_TOMEI } from "./acoes";
import {
  ACTIVITY_DO_ALARME,
  CANAL_ALARME,
  CANAL_LEMBRETE,
  COMPONENTE_DE_ALARME,
  registrarCanais,
} from "./canais-notifee";
import { pararDeSoar } from "./som-do-alarme";

/**
 * O agendador de avisos do app, um so para os dois modos que o cadastro promete.
 *
 * Uma biblioteca e nao duas porque cada uma so enxerga a propria lista de agendamentos: com duas, a
 * regra de nunca editar e sempre reconstruir dependia de lembrar de cancelar dos dois lados, e
 * esquecer uma linha traz de volta o alarme orfao sem o compilador denunciar. Com um agendador so,
 * `cancelarTudo` e literalmente tudo.
 */

/** O lembrete adiado sobrevive ao reagendamento. Ver `cancelarTudo`. */
export const PREFIXO_ADIADO = "adiado-";

/**
 * O aviso disparado pela tela de diagnostico, que tambem sobrevive.
 *
 * `cancelarTudo` roda a cada volta ao primeiro plano, e testar um alarme exige sair do app: sem a
 * excecao, o aviso de teste morreria no gesto que o proprio teste pede.
 */
const PREFIXO_DE_TESTE = "teste-";

/**
 * Aplicado aqui, e nao no dominio.
 *
 * `planejar-avisos-de-dose` decide quando avisar, nao como. Marcar o id nesta camada e o que deixa
 * o listener reconhecer um alarme sem que a regra pura conheca o Notifee.
 */
const PREFIXO_ALARME = "alarme:";

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

/**
 * Os avisos que a reconstrucao da janela nao apaga.
 *
 * Compara a chave e nao o id cru: o adiado e agendado como alarme, entao seu id vem
 * `alarme:adiado-...`, e testar o id inteiro apagaria o que esta regra existe para preservar.
 */
function sobreviveAoReagendamento(id: string): boolean {
  const chave = chaveDoId(id);
  return chave.startsWith(PREFIXO_ADIADO) || chave.startsWith(PREFIXO_DE_TESTE);
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
      // Vem do sistema e pode ser de uma versão anterior do app - uma notificação agendada semana
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

/** Os botoes do aviso, montados na hora a partir dele. */
function acoesDoAviso(aviso: AvisoDeDose): AndroidAction[] | undefined {
  if (aviso.doseScheduleIds.length === 0) return undefined;

  /**
   * O alarme nao carrega botoes: a resposta dele acontece na tela cheia.
   *
   * O Android exibe a mesma notificacao de duas formas, a tela cheia e um heads-up no topo. Com
   * botoes anexados o heads-up virava um segundo caminho para responder a mesma dose, e foi isso
   * que descontou o estoque duas vezes. A notificacao comum mantem os seus, porque ali nao ha tela
   * cheia e eles sao o unico caminho rapido.
   */
  if (aviso.modo === "alarm") return undefined;

  // Os rotulos mudam com a contagem: confirmar duas doses achando que confirmou uma e o erro que
  // eles tem de impedir. "Adiar" fica so na tela do alarme, onde "agora nao posso" faz sentido.
  const varias = aviso.doseScheduleIds.length > 1;
  return [
    { title: varias ? "Tomei todas" : "Tomei", pressAction: { id: ACAO_TOMEI } },
    { title: varias ? "Pulei todas" : "Pulei", pressAction: { id: ACAO_PULEI } },
  ];
}

export class NotifeeGateway implements NotificationGateway {
  async consultarPermissao(): Promise<NotificationPermission> {
    const { authorizationStatus } = await notifee.getNotificationSettings();
    if (authorizationStatus === AuthorizationStatus.AUTHORIZED) return "concedida";
    // `NOT_DETERMINED` e ausencia de resposta; `DENIED` e recusa. Confundir os dois fazia o card de
    // avisos bloqueados nunca aparecer na Home.
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
   * Abre a tela onde se concede acesso a politica do Nao Perturbe.
   *
   * Permissao especial: o `bypassDnd` do canal so vale depois dela, e o Android nunca a pede
   * sozinho. Tem que ser este intent, porque as configuracoes do app nao a mostram: ela vive numa
   * lista do sistema, junto dos outros apps que a pedem.
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

    /**
     * O gatilho nunca no passado.
     *
     * O Notifee recusa timestamp vencido com uma excecao, e ela derruba o laco inteiro de
     * `reagendarTodosOsAvisos`: um aviso impossivel deixa todos os seguintes sem agendar. Segunda
     * camada, porque `planejarAvisosDeDose` ja garante o piso na origem, mas por aqui passam o
     * adiado e o aviso de teste.
     */
    const agora = Date.now();
    const pedido = aviso.quando.getTime();
    const quandoAgendar = pedido > agora ? pedido : agora + 5_000;

    const gatilho: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: quandoAgendar,
      alarmManager: {
        /**
         * `SET_ALARM_CLOCK`, a categoria que o Android trata como despertador.
         *
         * `SET_EXACT_AND_ALLOW_WHILE_IDLE` dispara em Doze mas nao impede o sistema de agrupar o
         * disparo e adia-lo ate a proxima janela de manutencao: com a tela desligada o aviso so
         * chegava quando o celular era usado de novo. Vale para os dois modos, porque os dois tem
         * hora marcada; o que os diferencia e o canal, nao a pontualidade.
         */
        type: AlarmType.SET_ALARM_CLOCK,
      },
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
          // O instante **das doses**, e não o de tocar: no lembrete adiado os dois diferem, e é por
          // este campo que a tela de alarme encontra o que mostrar. Ver `instanteDasDoses`.
          scheduledFor: aviso.instanteDasDoses ?? aviso.quando.toISOString(),
        },
        android: {
          channelId: aviso.modo === "alarm" ? CANAL_ALARME : CANAL_LEMBRETE,
          importance: AndroidImportance.HIGH,
          // `category: ALARM` e o que autoriza a tela cheia a aparecer. So no modo alarme: dar isto
          // a um lembrete de consulta seria interromper quem nao pediu para ser interrompido.
          ...(ehAlarme ? { category: AndroidCategory.ALARM } : {}),
          // Drawable gerado a partir do `icon` do `app.json`. Sem declarar, cai no icone padrao do
          // sistema e o aviso fica com cara de app generico.
          smallIcon: "notification_icon",
          color: colors.primary,
          ...(ehAlarme
            ? {
                // `ongoing` sobe o aviso acima dos outros e barra o deslize na tela de bloqueio,
                // que e onde o alarme mais importa. Nao garante mais que ele fique: o Android 14
                // permite arrastar notificacoes `ongoing` com o aparelho desbloqueado.
                autoCancel: false,
                ongoing: true,
                // O alarme sobe como foreground service, e e ele quem toca o som: o canal e mudo, e
                // a tela cheia nem sempre sobe, porque com o aparelho em uso o Android a rebaixa.
                asForegroundService: true,
                foregroundServiceTypes: [
                  AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
                ],
                /**
                 * Explicito para contornar um defeito da ponte, e nao por preferencia.
                 *
                 * A lib ja injeta `IMMEDIATE` sozinha, para evitar o atraso de ate 10s que o
                 * Android 12+ impoe a notificacao de um foreground service. Mas o valor atravessa
                 * como `Double`, todo numero em JS e, e o lado Java le com `getInt()`, que devolve
                 * o padrao: justamente o adiamento que o `IMMEDIATE` existia para evitar.
                 *
                 * Passar daqui nao conserta a ponte; garante que a intencao fique escrita. A
                 * correcao real esta em `scripts/patch-servico-sem-atraso.js`.
                 */
                foregroundServiceBehavior: AndroidForegroundServiceBehavior.IMMEDIATE,
                /**
                 * A peca que sustenta a promessa central: a tela do alarme por cima do bloqueio,
                 * sem passar pelo roteador.
                 *
                 * O `mainComponent` nao e redundancia: o extra que leva o horario da dose a tela
                 * por `initialProps` so e anexado ao intent quando ele esta presente.
                 *
                 * `NEW_TASK` e explicito porque o caminho do full-screen nao o aplica sozinho, ao
                 * contrario do toque. Sem ele a Activity nao nasce em task propria, e fecha-la
                 * revelaria o app em vez do bloqueio.
                 */
                fullScreenAction: {
                  id: "alarme",
                  launchActivity: ACTIVITY_DO_ALARME,
                  launchActivityFlags: [AndroidLaunchActivityFlag.NEW_TASK],
                  mainComponent: COMPONENTE_DE_ALARME,
                },
                /**
                 * O toque no corpo abre o app, e nao o componente nativo.
                 *
                 * Com `mainComponent` tambem aqui, tocar fazia o Notifee subir a Activity nativa e
                 * o listener empurrar a rota do alarme: a mesma tela por dois caminhos, uma sobre a
                 * outra, que era a causa do lampejo azul. Com `default`, quem decide para onde ir e
                 * o listener, num lugar so. O `fullScreenAction` fica porque e outra coisa.
                 */
                pressAction: { id: "default" },
                // Um alarme que dispara com o celular na mesa precisa ser visto.
                lightUpScreen: true,
                // Oculto na tela de bloqueio obrigaria a desbloquear para saber que remedio e, e o
                // canal ja e PUBLIC.
                visibility: AndroidVisibility.PUBLIC,
              }
            : {
                // Tocar no corpo abre o app na tela do horário - é onde a resposta parcial cabe.
                pressAction: { id: "default" },
              }),
          actions: acoesDoAviso(aviso),
        },
      },
      gatilho,
    );
  }

  /**
   * Cancela tudo que sera reconstruido, preservando so o adiado e o de teste.
   *
   * Por exclusao, e nao por inclusao: listar o que apagar exigiria lembrar de acrescentar cada tipo
   * novo de aviso, e o preco de esquecer um e o alarme orfao. Esquecer de preservar custa, no
   * maximo, um lembrete adiado que nao volta.
   */
  async cancelarTudo(): Promise<void> {
    if (Platform.OS !== "android") return;

    const pendentes = await notifee.getTriggerNotificationIds();
    const alvos = pendentes.filter((id) => !sobreviveAoReagendamento(id));
    if (alvos.length > 0) await notifee.cancelTriggerNotifications(alvos);
  }

  async contarPendentes(): Promise<number> {
    if (Platform.OS !== "android") return 0;
    return (await notifee.getTriggerNotificationIds()).length;
  }

  /**
   * Cancela tudo, sem as excecoes do `cancelarTudo`.
   *
   * Aquele prepara uma reconstrucao, e o que preserva volta a fazer sentido logo depois. Aqui nao
   * ha depois: os dados que davam sentido ao aviso deixaram de existir. Preservar o adiado neste
   * caminho era o que fazia um remedio apagado voltar a ser anunciado pelo nome.
   */
  async cancelarTodosOsAgendamentos(): Promise<void> {
    if (Platform.OS !== "android") return;

    const pendentes = await notifee.getTriggerNotificationIds();
    if (pendentes.length > 0) await notifee.cancelTriggerNotifications(pendentes);

    // O que já está na bandeja também: um alarme exibido continua nomeando o remédio apagado.
    await notifee.cancelDisplayedNotifications().catch(() => {});
  }

  /**
   * Tira o aviso da bandeja depois de respondido.
   *
   * No Android ele nao sai sozinho ao tocar num botao de acao: fica la, e cada toque dispara o
   * handler outra vez, o que geraria uma ingestao gravada por toque. A busca e pelo id que o app
   * deu, e nao pelo que o sistema atribuiu.
   */
  async dispensar(chave: string): Promise<void> {
    if (Platform.OS !== "android") return;

    // Quem chama conhece a chave do domínio, não o id do agendamento - e o alarme carrega prefixo.
    // Tentar as duas formas é mais barato que obrigar o chamador a saber qual foi usada.
    await notifee.cancelDisplayedNotification(chave).catch(() => {});
    await notifee.cancelDisplayedNotification(`${PREFIXO_ALARME}${chave}`).catch(() => {});
  }
}

/**
 * Tira da bandeja o alarme que esta tocando agora.
 *
 * Separado da dispensa por chave porque a tela nem sempre sabe qual chave disparou: ela recebe o
 * horario, e o alarme daquele horario e o que precisa sair.
 */
export async function dispensarAlarmeAtivo(): Promise<void> {
  if (Platform.OS !== "android") return;

  // O som para aqui, e nao em cada chamador: o audio e do app e nao morre com a notificacao, e esta
  // funcao e o funil de todos os caminhos que encerram um alarme.
  pararDeSoar();

  // So os alarmes: sem argumento, `cancelDisplayedNotifications` apagaria lembretes de outros
  // horarios e avisos de consulta que a pessoa ainda nao viu.
  const naBandeja = await notifee.getDisplayedNotifications();
  const nossos = naBandeja
    .map(({ notification }) => notification.id)
    .filter((id): id is string => typeof id === "string" && ehAlarmeDeTelaCheia(id));

  if (nossos.length > 0) await notifee.cancelDisplayedNotifications(nossos);
}
