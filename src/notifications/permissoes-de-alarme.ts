import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "react-native-notify-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";

import { CANAL_ALARME, registrarCanais } from "./canais-notifee";

/**
 * Tudo o que o alarme precisa do sistema operacional, num lugar so.
 *
 * O lembrete depende de quatro autorizacoes concedidas em quatro telas diferentes do Android, e
 * nenhuma avisa quando e revogada. Reunir aqui e o que permite a Home responder uma pergunta so:
 * este alarme vai tocar?
 *
 * Permissao negada nao pode ser pedida de novo - `requestPermission` retorna na hora, sem abrir
 * dialogo. Por isso o modulo detecta o que falta e leva a pessoa ate a tela exata onde se resolve.
 */

/**
 * As autorizacoes cujo estado o Android nao deixa ler: so da para registrar a ida ate a tela.
 *
 * Assume que quem foi la concedeu, e erra para o lado recuperavel. A alternativa seria o item nunca
 * sair do painel, e um painel que cobra o que ja foi feito ensina a ignorar o painel inteiro.
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
 * Os fabricantes que matam apps em segundo plano por conta propria.
 *
 * Sao os que implementam gerenciadores proprios de inicializacao automatica, nos quais o alarme nao
 * toca sem autorizacao manual; o catalogo de referencia e o dontkillmyapp.com. Fora da lista as
 * linhas nao aparecem, porque cobrar um ajuste que nao existe e mandar procurar o que nao se acha.
 */
const FABRICANTES_AGRESSIVOS = ["xiaomi", "redmi", "poco", "samsung", "motorola", "oppo", "vivo", "realme", "huawei", "honor"];

function fabricanteMataApps(): boolean {
  const marca = (Platform.constants as { Manufacturer?: string })?.Manufacturer ?? "";
  return FABRICANTES_AGRESSIVOS.some((nome) => marca.toLowerCase().includes(nome));
}

/**
 * As telas de inicio automatico sao proprietarias, e cada fabricante nomeia a sua.
 *
 * Os nomes mudam entre versoes da MIUI e da One UI, e nao ha como perguntar antes se a Activity
 * existe: `sendIntent` rejeita quando ela falta, e e isso que faz a cascata abaixo funcionar.
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
 * Tenta cada intent em ordem, e cai nas configuracoes do app quando nenhuma existe.
 *
 * `for` com `await` e nao `Promise.all`: a ordem e a regra, e disparar em paralelo abriria duas
 * telas em quem tem as duas.
 */
async function abrirPrimeiraTelaQueExistir(intents: readonly string[]): Promise<void> {
  for (const intent of intents) {
    try {
      await Linking.sendIntent(intent);
      return;
    } catch {
      // Activity inexistente neste aparelho: segue para a proxima.
    }
  }
  await Linking.openSettings();
}

/**
 * As coisas que o sistema precisa autorizar para o alarme funcionar de verdade.
 *
 * So entra o que o app consegue acompanhar, de dois jeitos: lendo o estado (notificacoes, alarme
 * exato, Nao Perturbe) ou registrando a ida (sobreposicao, inicio automatico, bateria), para as
 * telas que nao expoem estado a API nenhuma.
 *
 * A tela cheia nao entra: alem de nao ter leitura, a intent que a abre nao existe em todo aparelho
 * e cai num `openSettings()` que nao leva a lugar reconhecivel.
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
   * O que procurar depois que a tela do sistema abrir.
   *
   * As telas do Android nao explicam por que alguem chegou nelas: a do Nao Perturbe e uma lista de
   * dezenas de apps. Sem esta linha o toque levava a pessoa a um lugar estranho e a deixava la.
   *
   * Ausente onde a propria tela ja e a resposta.
   */
  comoFazer?: string;
  concedida: boolean;
  /**
   * Se `concedida` e leitura do sistema ou so a lembranca de ter aberto a tela.
   *
   * Sem esta distincao o painel dizia "concedida" para quem abriu a tela do autostart e saiu sem
   * ligar a chave, e o app ficava silencioso sem nada que explicasse por que.
   */
  verificavel: boolean;
  /** Sem ela o alarme nao toca. As demais degradam: toca em silencio, toca atrasado. */
  essencial: boolean;
  /** Abre a tela do sistema onde ela se concede. */
  abrir: () => Promise<void>;
};

export type DiagnosticoDeAlarme = {
  itens: ItemDePermissao[];
  /** O alarme dispara? Falso quando falta alguma essencial. */
  vaiTocar: boolean;
  /** Falta algo, essencial ou não - incluindo as que o app não consegue verificar. */
  temPendencia: boolean;
  /**
   * Falta alguma das que o app comprova, e e isso que autoriza a interface a alarmar.
   *
   * `temPendencia` inclui as nao-verificaveis, que nunca contam como atendidas ate a visita a tela
   * do sistema: usa-lo para pintar algo de vermelho deixaria o alerta permanente.
   */
  temPendenciaVerificavel: boolean;
};

/**
 * Consulta o estado real de cada permissao no aparelho.
 *
 * Sempre do sistema, nunca de cache: qualquer uma pode ter sido revogada enquanto o app estava em
 * segundo plano, e um alarme que a pessoa acha armado e nao esta e o pior estado possivel.
 */
export async function diagnosticarPermissoes(): Promise<DiagnosticoDeAlarme> {
  if (Platform.OS !== "android") {
    return { itens: [], vaiTocar: true, temPendencia: false, temPendenciaVerificavel: false };
  }

  // Recria o canal antes de ler: o diagnostico roda a cada volta ao primeiro plano, que e quando a
  // pessoa volta de autorizar o Nao Perturbe. Sem isto o canal ficaria com o `bypassDnd: false` com
  // que nasceu, e o item cobraria para sempre algo ja feito.
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
      // O "Alarmes e lembretes" do Android 14+. Sem ele o aviso chega, mas pode ser adiado para a
      // proxima janela de manutencao: uma dose lembrada meia hora depois e pior que nenhuma, porque
      // a pessoa confia num horario que o app nao cumpriu.
      chave: "alarmeExato",
      titulo: "Tocar na hora exata",
      descricao: "Sem isto o aviso pode atrasar dezenas de minutos.",
      // `NOT_SUPPORTED` conta como concedida: abaixo do Android 12 a permissao nao existe e o
      // alarme exato e o padrao, entao cobra-la seria pedir o que nao ha onde conceder.
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
      // Lido do canal, e nao de uma API de permissao: o app pede `bypassDnd: true` na criacao, mas
      // o Android so o mantem com a politica do Nao Perturbe concedida. Ler o canal de volta
      // responde a pergunta que interessa - o alarme atravessa o silencioso?
      concedida: canal?.bypassDnd === true,
      verificavel: true,
      essencial: false,
      /**
       * A tela de acesso a politica do Nao Perturbe, e nao as notificacoes do app.
       *
       * `openNotificationSettings` levava onde esta autorizacao nao existe, e a pessoa voltava sem
       * ter feito o que o item pedia. Ela vive numa lista geral do sistema, e e por isso que a
       * instrucao manda procurar o Mapill nela.
       */
      abrir: async () => {
        await Linking.sendIntent("android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS").catch(
          async () => {
            await notifee.openNotificationSettings();
          },
        );
      },
    },
    {
      /**
       * A permissao que faz a tela do alarme aparecer por cima de outro aplicativo.
       *
       * O `fullScreenAction` sobe sozinho sobre o bloqueio, mas com o aparelho em uso o Android o
       * rebaixa para um aviso no topo, e nao ha API que force o contrario. Com o Mapill aberto ele
       * contorna navegando; em outro aplicativo, nao ha o que navegar.
       *
       * Estado lembrado e nao lido, porque nenhuma das bibliotecas expoe `canDrawOverlays`.
       */
      chave: "sobreporApps",
      titulo: "Abrir o alarme sobre outros apps",
      descricao:
        "Sem isto, usando outro aplicativo você recebe só um aviso no topo, sem a tela do alarme.",
      comoFazer: "Procure o Mapill na lista e autorize.",
      concedida: await jaFoiPedida(CHAVES_DE_IDA.sobreposicao),
      verificavel: false,
      essencial: false,
      // `Linking.sendIntent` e nao `expo-intent-launcher`: aquele e modulo nativo, e importa-lo
      // derruba o app inteiro em qualquer binario que nao o contenha.
      abrir: async () => {
        await marcarComoPedida(CHAVES_DE_IDA.sobreposicao);
        await Linking.sendIntent("android.settings.action.MANAGE_OVERLAY_PERMISSION").catch(
          async () => {
            await Linking.openSettings();
          },
        );
      },
    },
  ];

  /**
   * As duas linhas que so aparecem em fabricante que mata apps.
   *
   * O autostart desligado impede qualquer aviso de chegar: nem alarme, nem notificacao, nem com o
   * app nos recentes. O agendamento existe e o sistema recusa acordar o processo. Num Pixel nao ha
   * autostart a ligar, e cobrar isso seria mandar procurar um ajuste que o sistema nao tem.
   */
  if (fabricanteMataApps()) {
    itens.push(
      {
        chave: "inicioAutomatico",
        titulo: "Permitir o início automático",
        descricao:
          "Sem isto o seu aparelho impede o Mapill de abrir sozinho, e nenhum aviso chega: nem alarme, nem notificação.",
        // A lista é geral em alguns fabricantes e a página do app em outros, porque a cascata de
        // intents cai no que existir (ver `abrirPrimeiraTelaQueExistir`). O texto cobre os dois.
        comoFazer: 'Ligue o "início automático" do Mapill.',
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
        // O nome exato da opção, porque a tela oferece quatro e a padrão é outra: o Android marca
        // "Economia de bateria (recomendado)" por conta, e é ela que atrasa o aviso.
        comoFazer: 'Em "Economia de bateria", escolha "Nenhuma restrição".',
        concedida: await jaFoiPedida(CHAVES_DE_IDA.bateria),
        verificavel: false,
        essencial: false,
        abrir: async () => {
          await marcarComoPedida(CHAVES_DE_IDA.bateria);
          // As configuracoes do proprio app, e nao a lista geral de otimizacao: na MIUI as duas sao
          // ajustes independentes, e a restricao que importa mora nos detalhes do app.
          await Linking.openSettings();
        },
      },
    );
  }

  const essenciaisOk = itens.every((item) => !item.essencial || item.concedida);

  return {
    itens,
    vaiTocar: essenciaisOk,
    temPendencia: itens.some((item) => !item.concedida),
    temPendenciaVerificavel: itens.some((item) => item.verificavel && !item.concedida),
  };
}

/**
 * Pede as permissões que **ainda podem ser pedidas** por diálogo.
 *
 * Só a de notificações abre diálogo, e só enquanto nunca foi negada. As outras não têm diálogo
 * nenhum: são telas do sistema, e a pessoa precisa ir até lá. Por isso esta função devolve o
 * diagnóstico completo - quem chama usa o que sobrou para mostrar o que ainda falta.
 */
export async function pedirPermissoesDeAlarme(): Promise<DiagnosticoDeAlarme> {
  if (Platform.OS !== "android") {
    return { itens: [], vaiTocar: true, temPendencia: false, temPendenciaVerificavel: false };
  }

  await notifee.requestPermission();
  return diagnosticarPermissoes();
}
