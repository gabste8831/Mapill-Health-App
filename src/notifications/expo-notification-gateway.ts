import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

import type {
  AvisoDeDose,
  NotificationGateway,
  NotificationPermission,
} from "@/domain/ports/notification-gateway";
import { categoriaDoAviso, registrarCategorias } from "./acoes";
import {
  CANAL_ALARME,
  CANAL_LEMBRETE,
  diagnosticarCanalDeAlarme,
  registrarCanais,
} from "./canais";

/**
 * O que viaja junto da notificação e volta quando ela é tocada. Sem isso não há como saber qual
 * horário disparou, e o app abriria na Home fazendo a pessoa procurar o que já estava na mão.
 */
export type DadosDoAviso = {
  chave: string;
  doseScheduleIds: string[];
  /** Instante ISO do horário — é o que a tela do horário usa para se situar. */
  scheduledFor: string;
};

/**
 * O lembrete adiado — o único aviso que **sobrevive** a um reagendamento.
 *
 * A regra é por exclusão, e não por inclusão: `cancelarTudo` apaga tudo que **não** começa com
 * este prefixo. É deliberado. Listar o que apagar exigiria lembrar de acrescentar cada tipo novo
 * de aviso (dose, compromisso, receita…), e o preço de esquecer um é o pior defeito deste bloco: o
 * alarme órfão, que continua tocando para algo que não existe mais. Esquecer de **preservar** algo
 * custa, no máximo, um lembrete adiado que não volta — recuperável, e visível na hora.
 */
export const PREFIXO_ADIADO = "adiado-";

/** Só o que já foi preparado uma vez nesta execução do app. */
let jaPreparado = false;

/**
 * Cria canais e categorias uma vez por execução. Idempotente do lado do sistema, mas a trava
 * evita repetir I/O a cada agendamento.
 */
async function prepararSistema(): Promise<void> {
  if (jaPreparado) return;
  await registrarCanais();
  await registrarCategorias();
  jaPreparado = true;

  // Só em desenvolvimento: diz no console o que o **sistema** guardou sobre o canal, e não o que
  // pedimos. Duas rodadas de teste se perderam com o canal nascendo mudo sem nenhum sinal disso.
  if (__DEV__) console.log("[Mapill] canal de alarme →", await diagnosticarCanalDeAlarme());
}

function traduzirPermissao(status: Notifications.NotificationPermissionsStatus): NotificationPermission {
  if (status.granted) return "concedida";
  // `canAskAgain` falso significa que o diálogo do sistema não abre mais — no Android isso
  // acontece já na primeira negativa. Tratar como "não pedida" faria o app insistir para sempre
  // num diálogo que nunca aparece.
  if (status.canAskAgain) return "naoPedida";
  return "negada";
}

/**
 * Implementação do `NotificationGateway` com `expo-notifications`.
 *
 * **É o único lugar do app que importa `expo-notifications`** — junto de `canais.ts` e `acoes.ts`,
 * seus vizinhos nesta pasta. O domínio define o contrato e não conhece o Expo (§2.6.1), o que
 * mantém a regra de *quando* avisar verificável em Node, sem aparelho.
 */
export class ExpoNotificationGateway implements NotificationGateway {
  async consultarPermissao(): Promise<NotificationPermission> {
    return traduzirPermissao(await Notifications.getPermissionsAsync());
  }

  async pedirPermissao(): Promise<NotificationPermission> {
    const atual = await Notifications.getPermissionsAsync();
    // Já concedida ou já definitivamente negada: pedir de novo não muda nada e, no segundo caso,
    // nem abre diálogo. Devolver o estado real é o que permite a tela explicar a saída.
    if (atual.granted || !atual.canAskAgain) return traduzirPermissao(atual);
    return traduzirPermissao(await Notifications.requestPermissionsAsync());
  }

  async abrirConfiguracoesDoSistema(): Promise<void> {
    await Linking.openSettings();
  }

  /**
   * Abre a tela do Android onde se concede **acesso à política do Não Perturbe**.
   *
   * É uma permissão especial: o `bypassDnd` do canal só passa a valer depois que ela é concedida, e
   * o Android **nunca a pede sozinho** — não há diálogo, só esta tela. Sem ela o alarme toca
   * normalmente, mas fica mudo com o Não Perturbe ligado, que é justamente quando ele mais
   * importaria.
   *
   * O caminho tem que ser este, e não `openSettings()`: as configurações do app não mostram essa
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

    const dados: DadosDoAviso = {
      chave: aviso.chave,
      doseScheduleIds: aviso.doseScheduleIds,
      scheduledFor: aviso.quando.toISOString(),
    };

    await Notifications.scheduleNotificationAsync({
      identifier: aviso.chave,
      content: {
        title: aviso.titulo,
        body: aviso.corpo,
        data: dados,
        categoryIdentifier: categoriaDoAviso(aviso.doseScheduleIds.length, aviso.semAcoesRapidas),
        // Booleano, e não o nome de um arquivo — quem decide o som no Android 8+ é o canal. Serve
        // ao iOS, onde não há canal e o som é decidido por notificação.
        sound: true,
        ...(Platform.OS === "android"
          ? { channelId: aviso.modo === "alarm" ? CANAL_ALARME : CANAL_LEMBRETE }
          : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: aviso.quando,
      },
    });
  }

  /**
   * Cancela **tudo que será reconstruído** — doses, compromissos e receitas —, preservando só o
   * lembrete adiado.
   *
   * A parte grosseira é deliberada: o pior defeito possível aqui é o **alarme órfão** — o lembrete
   * de um remédio que a pessoa já parou de tomar, ou de uma consulta que ela cancelou —, e ele
   * nasce justamente de tentar editar cirurgicamente o que já está agendado. Apagar e refazer é
   * idempotente, e idempotência é a única garantia barata de que nenhum sobreviva a uma edição.
   *
   * O que **não** pode ser apagado é o lembrete adiado. Ele não pertence à grade: nasce de um toque
   * em "Adiar", vive cinco minutos e morre ao tocar. Um `cancelAllScheduledNotificationsAsync()`
   * levaria ele junto sempre que qualquer coisa reagendasse a janela — e é justamente nesses cinco
   * minutos que a pessoa costuma abrir o app, o que apagaria em silêncio o aviso que ela pediu.
   */
  async cancelarTudo(): Promise<void> {
    const pendentes = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pendentes
        .filter((pendente) => !pendente.identifier.startsWith(PREFIXO_ADIADO))
        .map((pendente) => Notifications.cancelScheduledNotificationAsync(pendente.identifier)),
    );
  }

  async contarPendentes(): Promise<number> {
    const pendentes = await Notifications.getAllScheduledNotificationsAsync();
    return pendentes.length;
  }

  /**
   * Tira a notificação da bandeja depois de respondida.
   *
   * **No Android ela não sai sozinha** ao tocar num botão de ação — fica lá, e cada toque dispara o
   * handler outra vez. Foi assim que cinco toques em "Adiar" geraram cinco lembretes, e o mesmo
   * teria acontecido com "Tomei": cinco ingestões gravadas e cinco doses descontadas do estoque.
   *
   * Dispensar é o primeiro passo da resposta, antes de qualquer escrita: o dedo é mais rápido que
   * o banco, e a janela entre tocar e gravar é justamente onde o toque repetido cabe.
   */
  async dispensar(chave: string): Promise<void> {
    await Notifications.dismissNotificationAsync(chave).catch(() => {});
  }
}
