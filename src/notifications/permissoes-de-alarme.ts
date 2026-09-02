import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "@notifee/react-native";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";

import { CANAL_ALARME, registrarCanais } from "./canais-notifee";

/** O `applicationId` do app — a tela de tela cheia do Android 14 exige saber de quem ela é. */
const PACOTE = Constants.expoConfig?.android?.package ?? "com.gabsteffens.mapillapp";

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

/** As quatro coisas que o sistema precisa autorizar para o alarme funcionar de verdade. */
export type ItemDePermissao = {
  chave: "notificacoes" | "alarmeExato" | "telaCheia" | "naoPerturbe" | "bateria";
  /** O que a pessoa lê. Descreve a consequência, não o nome técnico da permissão. */
  titulo: string;
  descricao: string;
  concedida: boolean;
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

  const [settings, bateriaOtimizada, powerManager, canal] = await Promise.all([
    notifee.getNotificationSettings(),
    notifee.isBatteryOptimizationEnabled(),
    notifee.getPowerManagerInfo(),
    notifee.getChannel(CANAL_ALARME),
  ]);

  const notificacoes = settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;

  const itens: ItemDePermissao[] = [
    {
      chave: "notificacoes",
      titulo: "Mostrar avisos",
      descricao: "Sem isto o Mapill não consegue avisar de nenhuma dose.",
      concedida: notificacoes,
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
      essencial: true,
      abrir: async () => {
        await notifee.openAlarmPermissionSettings();
      },
    },
    {
      /**
       * A permissão que faz a **tela cheia** aparecer, e não só uma notificação.
       *
       * O Android 14 mudou a regra: `USE_FULL_SCREEN_INTENT` deixou de ser concedida na instalação
       * e passou a exigir autorização explícita, reservada a apps de alarme e chamada. Declarada e
       * **não** autorizada, o sistema degrada em silêncio para uma notificação heads-up.
       *
       * Foi o que aconteceu no primeiro teste (02/09): o alarme "funcionou" — som e aviso —, mas a
       * tela não subiu, e sem a tela não há som contínuo, porque o loop mora nela. O sintoma
       * engana justamente por parecer sucesso parcial.
       *
       * Não há API de leitura: nem o Notifee nem o Expo expõem o estado desta permissão. Fica
       * sempre listada, com o caminho para a tela onde se concede — melhor oferecer um passo a
       * mais do que esconder a razão de o alarme não abrir.
       */
      chave: "telaCheia",
      titulo: "Abrir a tela do alarme",
      descricao:
        "Sem isto o Android mostra só uma notificação, em vez de abrir a tela que toca até você desligar.",
      concedida: false,
      essencial: false,
      abrir: async () => {
        // A tela é por app e vive fora das configurações de notificação — só se chega por esta
        // intent, com o pacote do app na URI.
        await Linking.sendIntent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT", [
          { key: "android.provider.extra.APP_PACKAGE", value: PACOTE },
        ]).catch(async () => {
          // Android abaixo do 14 não tem esta tela, e a permissão já vem concedida: cair nas
          // configurações do app evita um botão que parece quebrado.
          await Linking.openSettings();
        });
      },
    },
    {
      chave: "naoPerturbe",
      titulo: "Tocar no silencioso",
      descricao: "Sem isto o alarme fica mudo quando o celular está no “Não perturbe”.",
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
      essencial: false,
      abrir: async () => {
        await notifee.openNotificationSettings();
      },
    },
    {
      chave: "bateria",
      titulo: "Funcionar com a tela apagada",
      descricao: "A economia de bateria do seu aparelho pode impedir o alarme de tocar.",
      concedida: !bateriaOtimizada,
      essencial: false,
      abrir: async () => {
        // Fabricantes agressivos (Xiaomi, Samsung, Motorola) têm uma tela **própria**, além da do
        // Android. `activity` não-nulo diz que este aparelho é um deles — e é lá que a configuração
        // que realmente mata o alarme costuma estar.
        if (powerManager.activity !== null) await notifee.openPowerManagerSettings();
        else await notifee.openBatteryOptimizationSettings();
      },
    },
  ];

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
 * Só a de notificações abre diálogo, e só enquanto nunca foi negada. As outras três não têm diálogo
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
