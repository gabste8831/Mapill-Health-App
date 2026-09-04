import notifee, { AndroidNotificationSetting, AuthorizationStatus } from "@notifee/react-native";
import { Linking, Platform } from "react-native";

import { CANAL_ALARME, registrarCanais } from "./canais-notifee";

/**
 * Tudo o que o alarme precisa do sistema operacional, num lugar só.
 *
 * ## Por que uma central, e não cada tela cuidando da sua
 *
 * O lembrete de dose depende de **três** autorizações diferentes, concedidas em três telas
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
 * As três coisas que o sistema precisa autorizar para o alarme funcionar de verdade.
 *
 * ## A regra que define quem entra nesta lista
 *
 * **Só entra o que o app consegue ler de volta.** Um item cujo estado não se lê nunca sai do
 * painel: ele continua cobrando depois de atendido, e um painel que cobra o que já foi feito ensina
 * a ignorar o painel inteiro — inclusive as duas linhas que de fato impedem o alarme de tocar.
 *
 * Eram cinco, e duas saíram por essa regra:
 *
 * - **Tela cheia** (`USE_FULL_SCREEN_INTENT`, Android 14+): não há API de leitura, então o item
 *   vivia com `concedida: false` fixo. A intent que abre a tela também não existe em todo aparelho,
 *   caindo num `openSettings()` genérico que não leva a lugar reconhecível.
 * - **Economia de bateria**: aqui o problema era mais sutil, e pior. Nos aparelhos com gerenciador
 *   próprio (Xiaomi, Samsung, Motorola) o item **abria uma tela e verificava outra** — mandava para
 *   o "início automático" do fabricante, mas lia `isBatteryOptimizationEnabled()`, a otimização do
 *   Android. São ajustes independentes: autorizar o autostart não muda o que estava sendo lido, e o
 *   item ficava pendente para sempre mesmo com tudo concedido. Não há API para o autostart — essas
 *   telas são proprietárias e não expõem estado.
 *
 * As duas permissões continuam valendo no aparelho; o que saiu foi a cobrança que ninguém conseguia
 * satisfazer nem verificar. A economia de bateria segue documentada na tela de ajuda de alertas,
 * como recomendação — que é o lugar de algo que se explica mas não se confere.
 */
export type ItemDePermissao = {
  chave: "notificacoes" | "alarmeExato" | "naoPerturbe";
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
      comoFazer: "Na lista que abrir, procure o Mapill e permita o acesso.",
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
