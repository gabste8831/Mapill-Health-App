import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "react-native-notify-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";

import { CANAL_ALARME, registrarCanais } from "./canais-notifee";

/**
 * Tudo o que o alarme precisa do sistema operacional, num lugar só.
 *
 * ## Por que uma central, e não cada tela cuidando da sua
 *
 * O lembrete de dose depende de **quatro** autorizações diferentes, concedidas em quatro telas
 * diferentes do Android, e nenhuma delas avisa quando é revogada. Antes disso elas estavam
 * espalhadas — a permissão de notificação no cadastro, o Não Perturbe num link solto — e o
 * resultado era o app prometendo um alarme que o sistema não deixava tocar, sem que ninguém
 * soubesse por quê.
 *
 * Reunir aqui é o que permite a Home responder uma pergunta só: **este alarme vai tocar?**
 *
 * ## O limite que não dá para contornar
 *
 * No Android, permissão negada **não pode ser pedida de novo**. `requestPermission` retorna na hora,
 * sem abrir diálogo nenhum. Não é escolha do app, é da plataforma — e por isso "pedir de novo" não
 * é uma opção que exista.
 *
 * O que existe, e é o que este módulo faz: **detectar** o que falta e **levar** a pessoa até a tela
 * exata onde se resolve. Um botão que abre a tela certa vale mais que um diálogo que nunca aparece.
 */

/**
 * As autorizações cujo estado o Android **não deixa ler** — só dá para registrar a ida até a tela.
 *
 * Três itens caem aqui, e o mecanismo é o mesmo do `sobreporApps` original: o app anota que levou a
 * pessoa até a tela do sistema e considera atendido. Não é uma leitura de verdade, e assume que quem
 * foi lá concedeu — mas erra para o lado recuperável. Quem não conceder fica com o comportamento de
 * antes, e o item volta se o app for reinstalado.
 *
 * A alternativa seria o item nunca sair do painel, e um painel que cobra o que já foi feito ensina a
 * ignorar o painel inteiro — inclusive as linhas que de fato impedem o alarme de tocar.
 */
const CHAVES_DE_IDA = {
  sobreposicao: "mapill:sobreposicao-pedida",
  bateria: "mapill:bateria-pedida",
  autostart: "mapill:autostart-pedido",
} as const;

async function jaFoiPedida(chave: string): Promise<boolean> {
  return (await AsyncStorage.getItem(chave).catch(() => null)) === "sim";
}

async function marcarComoPedida(chave: string): Promise<void> {
  await AsyncStorage.setItem(chave, "sim").catch(() => {});
}

/**
 * Os fabricantes que matam apps em segundo plano por conta própria.
 *
 * Não é uma lista de marcas por preconceito: são os que implementam gerenciadores próprios de
 * inicialização automática, e nos quais o alarme não toca sem autorização manual. O catálogo de
 * referência é o dontkillmyapp.com, que existe só para documentar isto fabricante por fabricante.
 *
 * Em aparelho fora da lista (Pixel, Nokia, Sony) as duas linhas não aparecem: cobrar um ajuste que
 * não existe naquele sistema é pedir para a pessoa procurar algo que ela não vai achar.
 */
const FABRICANTES_AGRESSIVOS = ["xiaomi", "redmi", "poco", "samsung", "motorola", "oppo", "vivo", "realme", "huawei", "honor"];

function fabricanteMataApps(): boolean {
  const marca = (Platform.constants as { Manufacturer?: string })?.Manufacturer ?? "";
  return FABRICANTES_AGRESSIVOS.some((nome) => marca.toLowerCase().includes(nome));
}

/**
 * As telas de início automático são **proprietárias**, e cada fabricante nomeia a sua.
 *
 * A intent é tentada na ordem: a específica do fabricante primeiro, e as configurações do app como
 * último recurso. `sendIntent` rejeita quando a Activity não existe, e é isso que faz a cascata
 * funcionar — não há como perguntar antes se ela está lá.
 *
 * Os nomes vêm do dontkillmyapp.com e mudam entre versões da MIUI/One UI, e é justamente por isso
 * que existe o fallback: uma Activity renomeada faz o toque cair nas configurações do app, onde a
 * instrução do item ainda orienta a busca.
 */
const TELAS_DE_AUTOSTART = [
  // MIUI / HyperOS (Xiaomi, Redmi, Poco)
  "miui.intent.action.OP_AUTO_START",
  // Coloros (Oppo, Realme)
  "com.coloros.safecenter.permission.startup.StartupAppListActivity",
  // Huawei / Honor
  "huawei.intent.action.HSM_BOOTAPP_MANAGER",
];

/**
 * Tenta cada intent em ordem, e cai nas configurações do app quando nenhuma existe.
 *
 * Um `for` com `await` de propósito, e não `Promise.all`: a ordem **é** a regra — a tela do
 * fabricante primeiro, a genérica no fim. Disparar em paralelo abriria duas telas em quem tem as
 * duas.
 */
async function abrirPrimeiraTelaQueExistir(intents: readonly string[]): Promise<void> {
  for (const intent of intents) {
    try {
      await Linking.sendIntent(intent);
      return;
    } catch {
      // Activity inexistente neste aparelho: segue para a próxima da lista.
    }
  }
  // Nenhuma das proprietárias respondeu. As configurações do app são o lugar mais próximo de onde a
  // pessoa consegue seguir, e a instrução do item continua orientando a busca.
  await Linking.openSettings();
}

/**
 * As coisas que o sistema precisa autorizar para o alarme funcionar de verdade.
 *
 * ## A regra que define quem entra nesta lista
 *
 * **Só entra o que o app consegue acompanhar.** Um item que continua cobrando depois de atendido
 * ensina a ignorar o painel inteiro — inclusive as linhas que de fato impedem o alarme de tocar.
 *
 * Há duas formas de acompanhar, e a diferença importa:
 *
 * 1. **Lendo o estado** — notificações, alarme exato, Não Perturbe. O Android responde se estão
 *    concedidas, então a linha some quando de fato foram.
 * 2. **Registrando a ida** — sobreposição, início automático, bateria. Essas telas não expõem
 *    estado a nenhuma API, e o app anota que levou a pessoa até lá (ver `CHAVES_DE_IDA`). Não é
 *    leitura de verdade, mas erra para o lado recuperável: quem não conceder fica com o
 *    comportamento de antes, e a linha volta se o app for reinstalado.
 *
 * ## O que já saiu daqui, e por quê
 *
 * A **tela cheia** (`USE_FULL_SCREEN_INTENT`, Android 14+) saiu em 05/09 e não voltou: além de não
 * ter leitura, a intent que a abre não existe em todo aparelho, caindo num `openSettings()` que não
 * leva a lugar reconhecível. Sem uma tela de destino confiável, não há o que oferecer.
 *
 * A **economia de bateria** saiu pelo motivo errado e voltou em 12/09. O defeito da versão antiga
 * era **abrir uma tela e verificar outra** — mandava para o início automático do fabricante e lia
 * `isBatteryOptimizationEnabled()`, a otimização do Android, que é ajuste independente. Com as duas
 * separadas em linhas próprias, cada uma abre a sua tela e registra a sua ida.
 */
export type ItemDePermissao = {
  chave:
    | "notificacoes"
    | "alarmeExato"
    | "naoPerturbe"
    | "sobreporApps"
    | "inicioAutomatico"
    | "bateria";
  /** O que a pessoa lê. Descreve a consequência, não o nome técnico da permissão. */
  titulo: string;
  descricao: string;
  /**
   * O que procurar **depois** que a tela do sistema abrir.
   *
   * As telas do Android não explicam por que alguém chegou nelas: a de política do Não Perturbe é
   * uma lista de dezenas de apps, e a de bateria abre numa página de opções onde nada diz respeito
   * ao alarme. Sem esta linha, o toque no item levava a pessoa a um lugar estranho e a deixava lá —
   * era o que fazia o painel parecer quebrado mesmo abrindo a tela certa.
   *
   * Ausente nos itens em que a própria tela já é a resposta (o interruptor de notificações do app).
   */
  comoFazer?: string;
  concedida: boolean;
  /**
   * Se `concedida` é uma **leitura** do sistema ou só a lembrança de ter aberto a tela.
   *
   * `false` nas três que nenhuma API expõe (sobrepor apps, início automático, bateria). Quem mostra
   * o item usa isto para não afirmar o que o app não sabe: na tela de ajuda elas aparecem sem ícone
   * de concedido, com o convite a abrir e olhar.
   *
   * Sem esta distinção, o painel dizia "concedida" para quem abriu a tela do Autostart e saiu sem
   * ligar a chave — e o app ficava silencioso sem nada que explicasse por quê (achado de 12/09).
   */
  verificavel: boolean;
  /**
   * Sem ela o alarme **não toca de jeito nenhum**. As demais degradam a experiência (toca em
   * silêncio, toca atrasado), mas esta é a diferença entre existir e não existir.
   */
  essencial: boolean;
  /** Abre a tela do sistema onde ela se concede. */
  abrir: () => Promise<void>;
};

export type DiagnosticoDeAlarme = {
  itens: ItemDePermissao[];
  /** O alarme dispara? Falso quando falta alguma essencial. */
  vaiTocar: boolean;
  /** Falta algo, essencial ou não. */
  temPendencia: boolean;
};

/**
 * Consulta o estado real de cada permissão no aparelho.
 *
 * Sempre lê do sistema, nunca de cache: qualquer uma delas pode ter sido revogada nas configurações
 * enquanto o app estava em segundo plano, e um alarme que a pessoa acha que está armado e não está
 * é o pior estado possível deste app.
 */
export async function diagnosticarPermissoes(): Promise<DiagnosticoDeAlarme> {
  if (Platform.OS !== "android") {
    return { itens: [], vaiTocar: true, temPendencia: false };
  }

  /**
   * Recria o canal **antes** de ler, se ele estiver desatualizado.
   *
   * O diagnóstico roda a cada volta ao primeiro plano — que é exatamente quando a pessoa volta de
   * ter autorizado o Não Perturbe. Sem isto, o canal continuaria com o `bypassDnd: false` com que
   * nasceu, e o item ficaria pendente para sempre, cobrando algo já feito.
   */
  await registrarCanais();

  const [settings, canal] = await Promise.all([
    notifee.getNotificationSettings(),
    notifee.getChannel(CANAL_ALARME),
  ]);

  const notificacoes = settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;

  const itens: ItemDePermissao[] = [
    {
      chave: "notificacoes",
      titulo: "Mostrar avisos",
      descricao: "Sem isto o Mapill não consegue avisar de nenhuma dose.",
      concedida: notificacoes,
      verificavel: true,
      essencial: true,
      abrir: async () => {
        await notifee.openNotificationSettings();
      },
    },
    {
      /**
       * `alarmEnabled` é o "Alarmes e lembretes" do Android 14+. Sem ele o aviso ainda chega, mas
       * o sistema pode adiá-lo para a próxima janela de manutenção — e uma dose lembrada meia hora
       * depois, em silêncio, é pior que um lembrete que não veio: a pessoa confia num horário que o
       * app não cumpriu.
       */
      chave: "alarmeExato",
      titulo: "Tocar na hora exata",
      descricao: "Sem isto o aviso pode atrasar dezenas de minutos.",
      /**
       * `NOT_SUPPORTED` conta como concedida: em Android abaixo do 12 esta permissão **não existe**,
       * e o alarme exato é o comportamento padrão. Tratá-la como pendente ali faria o app cobrar
       * para sempre uma autorização que não há onde conceder.
       */
      concedida: settings.android.alarm !== AndroidNotificationSetting.DISABLED,
      verificavel: true,
      essencial: true,
      abrir: async () => {
        await notifee.openAlarmPermissionSettings();
      },
    },
    {
      chave: "naoPerturbe",
      titulo: "Tocar no silencioso",
      descricao: "Sem isto o alarme fica mudo quando o celular está no “Não perturbe”.",
      comoFazer: "Procure o Mapill na lista e permita.",
      /**
       * Lido do **canal**, e não de uma API de permissão.
       *
       * O app pede `bypassDnd: true` ao criar o canal, mas o Android só o mantém se a autorização
       * de política do Não Perturbe estiver concedida — sem ela, o canal nasce com `false` e a flag
       * é ignorada em silêncio. Então ler o canal de volta responde exatamente a pergunta que
       * interessa: *o alarme atravessa o silencioso?*
       *
       * Antes disto o item era `false` fixo, e ficava na lista **para sempre**, mesmo depois de
       * concedido — cobrando algo que a pessoa já tinha feito, que é o jeito mais rápido de ensinar
       * a ignorar o painel inteiro.
       */
      concedida: canal?.bypassDnd === true,
      verificavel: true,
      essencial: false,
      /**
       * A tela de **acesso à política do Não Perturbe**, e não as notificações do app.
       *
       * `openNotificationSettings()` levava às notificações do Mapill — onde esta autorização não
       * existe. Quem chegava lá via as categorias de notificação, não achava nada sobre silencioso,
       * e voltava sem ter feito o que o item pedia. O item continuava pendente, e o motivo era
       * invisível.
       *
       * A autorização vive numa lista do sistema (todos os apps que podem furar o Não Perturbe), e
       * é a intent abaixo que a abre. Sem `extra` de pacote: esta tela é uma lista geral, e é por
       * isso que a instrução manda procurar o Mapill nela.
       */
      abrir: async () => {
        await Linking.sendIntent("android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS").catch(
          async () => {
            // Aparelho sem essa tela: as notificações do app são o lugar mais próximo de onde a
            // pessoa consegue seguir, e é melhor que um toque que não faz nada.
            await notifee.openNotificationSettings();
          },
        );
      },
    },
    {
      /**
       * A permissão que faz a tela do alarme aparecer **por cima de outro aplicativo**.
       *
       * O `fullScreenAction` sobe sozinho sobre a tela de bloqueio (é o que `showWhenLocked` no
       * manifesto garante), mas com o aparelho **em uso** o Android o rebaixa para um aviso no topo
       * — a própria documentação do Notifee diz isso, e não há API que force o contrário. Quando o
       * Mapill é o app aberto, ele contorna navegando por conta própria; em outro aplicativo, não há
       * o que navegar.
       *
       * `SYSTEM_ALERT_WINDOW` é o que autoriza iniciar uma tela a partir do segundo plano. É o mesmo
       * mecanismo por trás da tela de chamada do WhatsApp aparecendo sobre qualquer coisa.
       *
       * ## O estado é lembrado, e não lido
       *
       * Nem o Notifee nem o `expo-intent-launcher` expõem `canDrawOverlays`, então não há como
       * perguntar ao Android se a permissão está concedida. A alternativa seria o item nunca sair do
       * painel — o defeito que fez a linha de tela cheia ser removida em 05/09.
       *
       * A saída é registrar a ida: quem tocou no item foi levado à tela do sistema, e o app anota
       * isso. Não é uma leitura de verdade, e assume que quem foi até lá concedeu — mas erra para o
       * lado recuperável. Quem não conceder continua com o comportamento de hoje (o aviso no topo),
       * e o item volta a aparecer se o app for reinstalado.
       */
      chave: "sobreporApps",
      titulo: "Abrir o alarme sobre outros apps",
      descricao:
        "Sem isto, usando outro aplicativo você recebe só um aviso no topo, sem a tela do alarme.",
      comoFazer: "Procure o Mapill na lista e autorize.",
      concedida: await jaFoiPedida(CHAVES_DE_IDA.sobreposicao),
      verificavel: false,
      essencial: false,
      /**
       * `Linking.sendIntent`, e **não** `expo-intent-launcher`.
       *
       * O pacote faria o mesmo, mas é módulo nativo: importá-lo derruba o app inteiro em qualquer
       * binário que não o contenha, e foi o que aconteceu em 05/09 — o import quebrou a Home, que
       * levou o layout junto, num aparelho rodando a build anterior. `sendIntent` já vem no React
       * Native e é o que os outros itens deste painel usam.
       */
      abrir: async () => {
        await marcarComoPedida(CHAVES_DE_IDA.sobreposicao);
        await Linking.sendIntent("android.settings.action.MANAGE_OVERLAY_PERMISSION").catch(
          async () => {
            // Fabricante que não exponha a tela geral: as configurações do app são o lugar mais
            // próximo de onde a pessoa consegue seguir.
            await Linking.openSettings();
          },
        );
      },
    },
  ];

  /**
   * As duas linhas que **só aparecem em fabricante que mata apps**.
   *
   * Elas entram no painel por decisão do Gabriel em 12/09, depois de o Autostart desligado ter
   * impedido **qualquer** aviso de chegar num Xiaomi — nem alarme, nem notificação, nem com o app
   * nos recentes. O agendamento existia e o sistema recusava acordar o processo.
   *
   * Ficaram fora até aqui pela regra do painel: só entra o que o app lê de volta, e estas telas são
   * proprietárias e não expõem estado. O que muda é o mecanismo — elas usam a mesma lembrança do
   * `sobreporApps`, que registra a ida em vez de ler a permissão. Assim a linha some depois de
   * atendida, que é o que a regra protegia.
   *
   * **Só em aparelho da lista.** Num Pixel não existe Autostart a ligar, e cobrar isso seria mandar
   * a pessoa procurar um ajuste que o sistema dela não tem.
   */
  if (fabricanteMataApps()) {
    itens.push(
      {
        chave: "inicioAutomatico",
        titulo: "Permitir o início automático",
        descricao:
          "Sem isto o seu aparelho impede o Mapill de abrir sozinho, e nenhum aviso chega — nem alarme, nem notificação.",
        comoFazer: "Procure o Mapill na lista e ligue a chave.",
        concedida: await jaFoiPedida(CHAVES_DE_IDA.autostart),
        verificavel: false,
        // Essencial: é a única linha deste painel que, sozinha, silencia o app por completo.
        essencial: true,
        abrir: async () => {
          await marcarComoPedida(CHAVES_DE_IDA.autostart);
          await abrirPrimeiraTelaQueExistir(TELAS_DE_AUTOSTART);
        },
      },
      {
        chave: "bateria",
        titulo: "Tirar a restrição de bateria",
        descricao: "Com a economia ativa, o aviso pode atrasar dezenas de minutos ou não chegar.",
        comoFazer: 'Escolha "Sem restrições" para o Mapill.',
        concedida: await jaFoiPedida(CHAVES_DE_IDA.bateria),
        verificavel: false,
        essencial: false,
        abrir: async () => {
          await marcarComoPedida(CHAVES_DE_IDA.bateria);
          /**
           * A tela de otimização de bateria do **Android puro**, e as configurações do app como
           * reserva.
           *
           * `IGNORE_BATTERY_OPTIMIZATION_SETTINGS` é a lista geral, e existe na maioria dos
           * aparelhos — inclusive nos que têm gerenciador próprio, onde ela coexiste com o do
           * fabricante. O `openSettings` cobre quem a removeu.
           */
          await Linking.sendIntent("android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS").catch(
            async () => {
              await Linking.openSettings();
            },
          );
        },
      },
    );
  }

  const essenciaisOk = itens.every((item) => !item.essencial || item.concedida);

  return {
    itens,
    vaiTocar: essenciaisOk,
    temPendencia: itens.some((item) => !item.concedida),
  };
}

/**
 * Pede as permissões que **ainda podem ser pedidas** por diálogo.
 *
 * Só a de notificações abre diálogo, e só enquanto nunca foi negada. As outras não têm diálogo
 * nenhum: são telas do sistema, e a pessoa precisa ir até lá. Por isso esta função devolve o
 * diagnóstico completo — quem chama usa o que sobrou para mostrar o que ainda falta.
 */
export async function pedirPermissoesDeAlarme(): Promise<DiagnosticoDeAlarme> {
  if (Platform.OS !== "android") {
    return { itens: [], vaiTocar: true, temPendencia: false };
  }

  await notifee.requestPermission();
  return diagnosticarPermissoes();
}
