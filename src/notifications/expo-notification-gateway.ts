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

  /**
   * Só em desenvolvimento: diz no console o que o **sistema** guardou sobre o canal, e não o que
   * pedimos. Duas rodadas de teste se perderam com o canal nascendo mudo sem nenhum sinal disso.
   *
   * Dentro de `try`: em 01/09 uma falha ao resolver esta função derrubou o `prepararSistema`
   * inteiro, e com ele o reagendamento de todos os avisos. **Uma ferramenta de diagnóstico não
   * pode quebrar o que ela existe para observar** — o pior modo de falhar de um app de medicação é
   * o alarme sumir por causa de um `console.log`.
   */
  if (__DEV__) {
    try {
      console.log("[Mapill] canal de alarme →", await diagnosticarCanalDeAlarme());
    } catch (erro) {
      console.log("[Mapill] diagnóstico do canal indisponível:", erro);
    }
  }
}

function traduzirPermissao(status: Notifications.NotificationPermissionsStatus): NotificationPermission {
  if (status.granted) return "concedida";

  /**
   * **`naoPedida` só antes de existir uma resposta.** Depois que a pessoa já decidiu — e desligar
   * o app nas configurações do Android é decidir —, o estado é `negada`, mesmo que o sistema
   * ainda aceite abrir o diálogo.
   *
   * O erro anterior era usar `canAskAgain` como se ele respondesse "a pessoa já negou?". Ele
   * responde outra coisa: "o diálogo ainda abre?". Desligar nas configurações devolve
   * `granted: false` com `canAskAgain: true`, e o app concluía "ainda não perguntei" — então o
   * card de avisos bloqueados **nunca aparecia** na Home (falhou no bloco 10.1 em 01/09).
   *
   * `status.status` distingue os dois: `undetermined` é ausência de resposta; qualquer outra
   * coisa sem `granted` é recusa, tenha ela vindo do diálogo ou das configurações.
   */
  if (status.status === "undetermined") return "naoPedida";
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

    /**
     * Em desenvolvimento, diz **para qual canal cada aviso foi**.
     *
     * O diagnóstico de canal responde "o canal está bom?"; este responde "o aviso foi para o canal
     * certo?". São perguntas diferentes, e na validação de 01/09 a segunda ficou sem resposta: o
     * alarme não tocou e não havia como saber se o canal nasceu mudo ou se o aviso saiu como
     * lembrete. Com as duas linhas no console, a próxima falha se explica sem outra ida ao
     * aparelho.
     */
    if (__DEV__ && Platform.OS === "android") {
      const canal = aviso.modo === "alarm" ? CANAL_ALARME : CANAL_LEMBRETE;
      console.log(
        `[Mapill] agendando "${aviso.titulo}" → modo=${aviso.modo} canal=${canal} em ${aviso.quando.toLocaleString("pt-BR")}`,
      );
    }

    await Notifications.scheduleNotificationAsync({
      identifier: aviso.chave,
      content: {
        title: aviso.titulo,
        body: aviso.corpo,
        data: dados,
        categoryIdentifier: categoriaDoAviso(aviso.doseScheduleIds.length, aviso.semAcoesRapidas),
        /**
         * `sound` **só no iOS**, e por isso dentro do spread de plataforma.
         *
         * No Android 8+ quem decide o som é o canal, e este campo não deveria ter efeito nenhum —
         * mas ele tem: o nativo converte `true` para a string `"default"` e sai procurando um
         * arquivo com esse nome, que não existe. É a origem do
         * `Custom sound 'default' not found in native app` que aparecia a cada agendamento.
         *
         * É a **terceira** vez que a string "default" quebra o som deste app, sempre pelo mesmo
         * mal-entendido: no Android, ausência significa "som padrão" e qualquer string significa
         * "arquivo com este nome". Aqui a correção é não mandar o campo nesta plataforma.
         */
        ...(Platform.OS === "android"
          ? { channelId: aviso.modo === "alarm" ? CANAL_ALARME : CANAL_LEMBRETE }
          : { sound: true }),
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
