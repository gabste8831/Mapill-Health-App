import notifee, { EventType, type Event } from "react-native-notify-kit";

import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { ACAO_ADIAR, ACAO_PULEI, ACAO_TOMEI } from "./acoes";
import { pedirParaEncerrarAlarme } from "./doses-resolvidas";
import {
  dispensarAlarmeAtivo,
  ehAlarmeDeTelaCheia,
  lerDadosDoAviso,
  type DadosDoAviso,
} from "./notifee-gateway";
import { anotarHorarioEntregue, jaEstaEmCena } from "./alarme-em-cena";
import { destinoDaChave, type DestinoDoAviso } from "./destino-do-aviso";
import { todasAsDosesResolvidas, tratarRespostaAoAviso } from "./responder-aviso";

/**
 * O unico ponto de escuta dos avisos: botoes, toque no corpo e entrega com o app aberto.
 *
 * O `onBackgroundEvent` processa a resposta com o app fechado, que e o que sustenta a promessa do
 * botao "Tomei" de nao abrir o app. Um toque com o celular bloqueado grava a dose na hora.
 */

/** Devolve se a tela abriu de fato: quem recebe pode recusar, e a trava depende dessa diferenca. */
type AoDispararAlarme = (scheduledFor: string) => boolean;
type AoAbrirHorario = (dados: DadosDoAviso) => void;

type AoAbrirDestino = (destino: DestinoDoAviso) => void;

let aoDispararAlarme: AoDispararAlarme | null = null;
let aoAbrirHorario: AoAbrirHorario | null = null;
let aoAbrirDestino: AoAbrirDestino | null = null;

/**
 * Horarios cuja tela de alarme ja foi aberta nesta execucao.
 *
 * No modulo porque os handlers do Notifee tambem vivem ali: registrados uma vez, sobrevivem as
 * montagens de tela. Um `Set` em componente seria zerado a cada navegacao.
 */
const jaAbertos = new Set<string>();

/**
 * Quanto atraso uma dose ainda pode ter para irromper em tela cheia.
 *
 * O da manha ainda vale se a pessoa pegou o celular ao meio-dia; o de ontem nao irrompe hoje.
 * Passado isso o aviso continua na bandeja e no historico, mas nao como despertador.
 *
 * Nao confundir com `TOLERANCIA_DE_ATRASO_EM_MINUTOS`, que resolve o oposto: aquele decide o que
 * ainda deve ser agendado, este o que ainda deve acordar alguem.
 */
const ATRASO_MAXIMO_PARA_TELA_CHEIA_EM_MS = 4 * 60 * 60 * 1000;

/**
 * Esquece o que ja foi aberto, a cada reconstrucao da janela de avisos.
 *
 * A trava vale dentro de um disparo, e nao para sempre. Editar um tratamento apaga as doses futuras
 * e gera outras com o mesmo `scheduledFor`: sem limpar, o horario editado de volta para alarme nao
 * subia mais a tela, porque o `DELIVERED` morria na trava antiga.
 */
export function esquecerAlarmesAbertos(): void {
  jaAbertos.clear();
}

/**
 * Marca o horario como aberto para quem abre depois de `aoDispararAlarme`.
 *
 * O caminho normal marca pelo retorno do callback. O caminho tardio de `use-dose-notifications`
 * abre a rota depois de esperar a Activity nativa, quando o callback ja respondeu `false` - o
 * retorno e sincrono e nao podia esperar. Sem isto o `DELIVERED` seguinte empilharia outra tela.
 */
export function marcarAlarmeComoAberto(scheduledFor: string): void {
  jaAbertos.add(scheduledFor);
}

/**
 * Grava que o estoque ja foi avisado, com a quantidade que havia no momento.
 *
 * E a trava que impede uma notificacao por dose confirmada, ja que a previsao e recalculada a cada
 * ingestao. So repor a caixa rearma.
 *
 * Na entrega, e nao no agendamento: gravada ao planejar, ela matava o proprio aviso que acabara de
 * criar, porque o reagendamento seguinte comparava a quantidade consigo mesma.
 */
async function marcarEstoqueComoAvisado(chave: string): Promise<void> {
  const inventoryId = chave.replace(/^estoque-/, "").replace(/-(baixo|acabou)$/, "");
  if (inventoryId === chave) return;

  try {
    const repositorio = new InventoryRepository();
    const inventory = await repositorio.findById(inventoryId);
    if (inventory === null) return;
    if (inventory.lowStockAlertedAtQuantity === inventory.quantity) return;

    await repositorio.save({
      ...inventory,
      lowStockAlertedAtQuantity: inventory.quantity,
      updatedAt: new Date().toISOString(),
      syncedAt: null,
    });
  } catch (cause) {
    if (__DEV__) console.error("[Mapill] falha ao marcar o estoque como avisado:", cause);
  }
}

async function tratar(evento: Event): Promise<void> {
  const notificacao = evento.detail.notification;
  const id = notificacao?.id;
  if (notificacao === undefined || id === undefined) return;

  const dados = lerDadosDoAviso(notificacao.data);
  if (dados === null) return;

  // O aviso de estoque chegou: a partir de agora ele fica calado até haver reposição.
  if (evento.type === EventType.DELIVERED && dados.chave.startsWith("estoque-")) {
    await marcarEstoqueComoAvisado(dados.chave);
    return;
  }

  /**
   * O alarme chegou com o app aberto: o app abre a tela ele mesmo.
   *
   * O Android rebaixa o `fullScreenAction` para heads-up quando a pessoa esta usando o celular, e a
   * API nao deixa forcar. Com o app em primeiro plano existe caminho que nao depende do sistema:
   * navegar quando o `DELIVERED` chega.
   */
  if (evento.type === EventType.DELIVERED) {
    if (!ehAlarmeDeTelaCheia(id)) return;

    /**
     * Antes de qualquer guarda, e e a rede que impede a tela azul vazia.
     *
     * `AlarmeRaiz` le o horario da notificacao, mas o `PRESS` a cancela ao tratar o toque, e as
     * duas coisas correm juntas. Aqui e o ponto mais cedo possivel; as guardas abaixo retornam em
     * casos onde a tela ainda pode subir por outro caminho, e o horario precisa estar guardado.
     */
    anotarHorarioEntregue(dados.scheduledFor);

    // `DELIVERED` chega mais de uma vez para a mesma notificacao, e cada repeticao empilharia outra
    // tela sobre a anterior.
    if (jaAbertos.has(dados.scheduledFor)) return;

    /**
     * A dose ja respondida nao reabre o alarme: e o caminho do lampejo azul.
     *
     * O gatilho nao e o toque, e o reagendamento. Responder grava o desfecho e reagenda tudo, e a
     * dose recem-respondida ainda cai na tolerancia de 2 minutos que existe para o aviso que acabou
     * de passar nao se perder. O aviso dispara quase na hora e a tela nasce e morre sozinha.
     */
    if (await todasAsDosesResolvidas(dados.doseScheduleIds)) {
      await notifee.cancelNotification(id).catch(() => {});
      // Esquece o horario: resolvido o que havia, a proxima entrega e um alarme novo. Sem isto ele
      // ficava marcado para sempre, e a tela nao subia mais depois de uma edicao.
      jaAbertos.delete(dados.scheduledFor);
      return;
    }

    /**
     * A dose que venceu ha muito nao irrompe em tela cheia.
     *
     * Os avisos sao agendados com `SET_ALARM_CLOCK`, e quando o relogio ultrapassa varios de uma
     * vez o sistema entrega todos antes de o app poder replanejar. Acontece de verdade com o
     * celular desligado a noite toda: acordar com seis alarmes empilhados de horarios ja passados
     * leva a tomar remedio fora de hora.
     *
     * `cancelNotification(id)` mira este aviso, e nao `dispensarAlarmeAtivo()`, que levaria junto
     * os seguintes da pilha, inclusive um ainda dentro da janela.
     */
    const atrasoEmMs = Date.now() - new Date(dados.scheduledFor).getTime();
    if (atrasoEmMs > ATRASO_MAXIMO_PARA_TELA_CHEIA_EM_MS) {
      await notifee.cancelNotification(id).catch(() => {});
      return;
    }

    /**
     * A Activity nativa ja esta na frente: nao empurra a rota por baixo dela.
     *
     * O `jaAbertos` nao cobre isto, porque so sabe o que este listener abriu, e a Activity e
     * montada pelo Android sem passar por aqui. `alarme-em-cena` e o registro compartilhado.
     */
    if (jaEstaEmCena(dados.scheduledFor)) return;

    // Marca depois, e so se a tela abriu mesmo: marcando antes, a recusa do caminho tardio gravava
    // o horario como aberto e a trava barrava a abertura de verdade. O tardio marca por conta
    // propria, porque o retorno daqui e sincrono e ja respondeu quando ele age.
    const abriu = aoDispararAlarme?.(dados.scheduledFor);
    if (abriu === true) jaAbertos.add(dados.scheduledFor);
    return;
  }

  /**
   * Deslizar para o lado encerra o lembrete, e o som para junto.
   *
   * Quem arrasta o aviso para fora esta dizendo "ja vi, pode parar", e insistir depois disso deixa
   * som tocando sem nada na tela para desliga-lo. A dose nao e respondida aqui: dispensar nao e
   * "tomei" nem "pulei", e ela segue pendente.
   */
  if (evento.type === EventType.DISMISSED) {
    if (!ehAlarmeDeTelaCheia(id)) return;
    // Sem argumento: existe no maximo uma tela de alarme por vez, entao nao ha outra a acertar.
    pedirParaEncerrarAlarme();
    return;
  }

  if (evento.type !== EventType.ACTION_PRESS && evento.type !== EventType.PRESS) return;

  // Aviso que nao e de dose: o toque navega e nao responde nada. Sai antes de
  // `tratarRespostaAoAviso` porque a lista de doses e vazia.
  const destino = destinoDaChave(dados.chave);
  if (destino !== null) {
    await notifee.cancelNotification(id);
    aoAbrirDestino?.(destino);
    return;
  }

  // `PRESS` e o toque no corpo, que leva a tela do horario. Nos botoes, o `pressAction.id` diz qual.
  const acao =
    evento.type === EventType.PRESS ? "" : (evento.detail.pressAction?.id ?? "");

  const resultado = await tratarRespostaAoAviso(acao, dados);

  if (resultado.tipo === "abrirHorario") {
    /**
     * Dose ja resolvida nao abre tela nenhuma.
     *
     * A tela se fecha sozinha quando tudo esta resolvido, entao abri-la para uma dose ja respondida
     * produz um lampejo. Acontece sempre que a resposta chegou por outro caminho antes do toque, e
     * o aviso continua na bandeja convidando ao toque tardio.
     */
    if (await todasAsDosesResolvidas(dados.doseScheduleIds)) {
      await notifee.cancelNotification(id).catch(() => {});
      await dispensarAlarmeAtivo().catch(() => {});
      pedirParaEncerrarAlarme();
      return;
    }

    /**
     * A tela cheia ja esta na frente: o toque nao a derruba.
     *
     * A MIUI gera um `PRESS` da bandeja por conta propria, na tela de bloqueio, sem ninguem ter
     * tocado. Sem esta guarda o `pedirParaEncerrarAlarme` abaixo fechava a tela certa para abrir
     * outra. Tambem fecha o caminho que abria o app sobre a tela de bloqueio.
     */
    if (jaEstaEmCena(dados.scheduledFor)) return;

    /**
     * O toque leva a tela do horario, e o som para, sem distinguir alarme de lembrete.
     *
     * Vale para o alarme que nao irrompeu, o caso que sobra depois da guarda acima. Os tres passos
     * nesta ordem sao o que torna o gesto imediato: tirar o aviso da bandeja junto com o servico
     * que toca, pedir que a tela cheia saia, e so entao abrir. Qualquer um que falte deixa som
     * tocando enquanto a pessoa ja decide em outra tela.
     */
    jaAbertos.delete(dados.scheduledFor);
    await notifee.cancelNotification(id).catch(() => {});
    await dispensarAlarmeAtivo().catch(() => {});
    pedirParaEncerrarAlarme();
    aoAbrirHorario?.(resultado.dados);
    return;
  }

  // Tira o aviso da bandeja depois de gravar: no Android a notificacao nao some ao tocar num botao
  // de acao, e cada toque dispara o handler de novo. A guarda contra repeticao vive em
  // `confirmarDosesDoAviso`; esta linha e a segunda camada.
  if (acao === ACAO_TOMEI || acao === ACAO_PULEI || acao === ACAO_ADIAR) {
    await notifee.cancelNotification(id).catch(() => {});
  }
}

/**
 * Liga os handlers, uma vez, no bootstrap.
 *
 * Sao dois porque o app pode estar em qualquer estado quando o aviso chega: o de segundo plano
 * cobre o app fechado, que e o caso normal de um alarme, e este cobre o app aberto.
 */
export function escutarAvisos(opcoes: {
  aoAbrirHorario: AoAbrirHorario;
  aoDispararAlarme: AoDispararAlarme;
  aoAbrirDestino: AoAbrirDestino;
}): () => void {
  aoAbrirHorario = opcoes.aoAbrirHorario;
  aoDispararAlarme = opcoes.aoDispararAlarme;
  aoAbrirDestino = opcoes.aoAbrirDestino;

  const parar = notifee.onForegroundEvent((evento) => void tratar(evento));

  return () => {
    aoAbrirHorario = null;
    aoDispararAlarme = null;
    aoAbrirDestino = null;
    parar();
  };
}

/**
 * Registrado fora do ciclo de vida do React, no `index.js`.
 *
 * Com o app fechado nao ha componente montado para assinar nada, e e este handler que grava a dose.
 * Dentro de um `useEffect`, o botao "Tomei" nao funcionaria no caso mais comum: celular bloqueado.
 */
export function registrarEventosEmSegundoPlano(): void {
  notifee.onBackgroundEvent(tratar);
}

/**
 * A resposta que abriu o app, quando ele estava fechado.
 *
 * O `onBackgroundEvent` resolve a escrita, mas nao a navegacao: quem tocou no corpo com o app
 * fechado precisa chegar na tela do horario, e a rota so existe depois que o app monta.
 */
export async function consultarRespostaDeAbertura(): Promise<
  { tipo: "horario"; dados: DadosDoAviso } | { tipo: "destino"; destino: DestinoDoAviso } | null
> {
  const inicial = await notifee.getInitialNotification();
  if (inicial === null) return null;

  // Nao ha guarda de alarme aqui: o `fullScreenAction` abre a `AlarmeActivity`, e este codigo so
  // roda dentro do `_layout`, que monta na `MainActivity`. Se ele esta rodando, ela subiu por toque.
  const dados = lerDadosDoAviso(inicial.notification.data);
  if (dados === null) return null;

  // Estoque, receita e compromisso abrem onde se resolve aquilo, e nao na Home: a notificacao chega
  // de madrugada e e vista de manha com o app fechado.
  const destino = destinoDaChave(dados.chave);
  if (destino !== null) return { tipo: "destino", destino };

  // Só o toque no corpo pede navegação. Se veio de um botão, o handler de segundo plano já gravou
  // o que tinha que gravar, e abrir a tela do horário seria mostrar uma dose já resolvida.
  const acao = inicial.pressAction?.id ?? "";
  if (acao === ACAO_TOMEI || acao === ACAO_ADIAR) return null;

  return { tipo: "horario", dados };
}
