import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "@notifee/react-native";
import { Platform } from "react-native";

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
  chave: "notificacoes" | "alarmeExato" | "naoPerturbe" | "bateria";
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

  const [settings, bateriaOtimizada, powerManager] = await Promise.all([
    notifee.getNotificationSettings(),
    notifee.isBatteryOptimizationEnabled(),
    notifee.getPowerManagerInfo(),
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
      chave: "naoPerturbe",
      titulo: "Tocar no silencioso",
      descricao: "Sem isto o alarme fica mudo quando o celular está no “Não perturbe”.",
      // O Notifee não expõe leitura desta permissão. Tratada como pendente por padrão: é melhor
      // oferecer um caminho a mais do que esconder o motivo de um alarme mudo.
      concedida: false,
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
