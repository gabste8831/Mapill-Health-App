import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

import type {
  AvisoDeDose,
  NotificationGateway,
  NotificationPermission,
} from "@/domain/ports/notification-gateway";
import { categoriaDoAviso, registrarCategorias } from "./acoes";
import { CANAL_ALARME, CANAL_LEMBRETE, registrarCanais } from "./canais";

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
 * Prefixo das chaves da **grade de horários** — as que `reagendarAvisosDeDose` reconstrói.
 *
 * Existe para separá-las do lembrete adiado (`PREFIXO_ADIADO`), que sobrevive ao reagendamento.
 * Precisa casar com o prefixo que `planejarAvisosDeDose` gera; a duplicação é o preço de o domínio
 * não conhecer esta camada, e está travada pelo teste em Node que verifica o formato da chave.
 */
export const PREFIXO_DA_GRADE = "dose-";
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
        categoryIdentifier: categoriaDoAviso(aviso.doseScheduleIds.length, aviso.jaAdiado),
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
   * Cancela os avisos **da grade de horários**, preservando os adiados.
   *
   * A parte grosseira é deliberada: o pior defeito possível aqui é o **alarme órfão** — o lembrete
   * de um remédio que a pessoa já parou de tomar —, e ele nasce justamente de tentar editar
   * cirurgicamente o que já está agendado. Apagar e refazer é idempotente, e idempotência é a única
   * garantia barata de que nenhum sobreviva a uma edição.
   *
   * O que **não** pode ser apagado é o lembrete adiado. Ele não pertence à grade: nasce de um toque
   * em "Adiar", vive cinco minutos e morre ao tocar. Um `cancelAllScheduledNotificationsAsync()`
   * levaria ele junto sempre que qualquer coisa reagendasse a janela — e é justamente nesses cinco
   * minutos que a pessoa costuma abrir o app, o que apagaria em silêncio o aviso que ela pediu.
   * Por isso o filtro por prefixo de identificador, em vez do cancelamento cego.
   */
  async cancelarTudo(): Promise<void> {
    const pendentes = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pendentes
        .filter((pendente) => pendente.identifier.startsWith(PREFIXO_DA_GRADE))
        .map((pendente) => Notifications.cancelScheduledNotificationAsync(pendente.identifier)),
    );
  }

  async contarPendentes(): Promise<number> {
    const pendentes = await Notifications.getAllScheduledNotificationsAsync();
    return pendentes.length;
  }
}
