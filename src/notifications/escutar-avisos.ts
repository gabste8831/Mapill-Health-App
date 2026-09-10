import notifee, { EventType, type Event } from "react-native-notify-kit";

import { ACAO_ADIAR, ACAO_PULEI, ACAO_TOMEI } from "./acoes";
import { pedirParaEncerrarAlarme } from "./doses-resolvidas";
import {
  dispensarAlarmeAtivo,
  ehAlarmeDeTelaCheia,
  lerDadosDoAviso,
  type DadosDoAviso,
} from "./notifee-gateway";
import { jaEstaEmCena } from "./alarme-em-cena";
import { destinoDaChave, type DestinoDoAviso } from "./destino-do-aviso";
import { todasAsDosesResolvidas, tratarRespostaAoAviso } from "./responder-aviso";

/**
 * O único ponto de escuta dos avisos — botões, toque no corpo e entrega com o app aberto.
 *
 * ## O que a unificação resolveu aqui
 *
 * Antes eram dois listeners com regras parecidas e ciclos de vida diferentes: um do
 * `expo-notifications` (respostas do modo `notification`) e um do Notifee (alarme de tela cheia).
 * Regra parecida em dois lugares é como as coisas divergem em silêncio — uma correção entra num e
 * não no outro, e nada denuncia.
 *
 * ## O ganho que não era só arrumação
 *
 * `onBackgroundEvent` processa a resposta **com o app fechado**. O caminho anterior dependia de
 * `getLastNotificationResponseAsync` no bootstrap, isto é, da pessoa abrir o app para a resposta
 * ser processada — para um botão "Tomei" que promete não abrir o app, isso não é detalhe, é a
 * promessa. Um toque no botão com o celular bloqueado agora grava a dose na hora.
 */

/** Avisa quem está ouvindo que um alarme foi entregue com o app aberto. */
type AoDispararAlarme = (scheduledFor: string) => void;
/** Avisa que o toque no corpo pede a tela do horário. */
type AoAbrirHorario = (dados: DadosDoAviso) => void;

type AoAbrirDestino = (destino: DestinoDoAviso) => void;

let aoDispararAlarme: AoDispararAlarme | null = null;
let aoAbrirHorario: AoAbrirHorario | null = null;
let aoAbrirDestino: AoAbrirDestino | null = null;

/**
 * Horários cuja tela de alarme já foi aberta nesta execução.
 *
 * Vive no módulo, e não em estado de React, porque os handlers do Notifee também vivem: são
 * registrados uma vez e sobrevivem às montagens e desmontagens de tela. Um `Set` em componente
 * seria zerado a cada navegação, e a trava não travaria nada.
 *
 * Não é limpo: são poucas entradas por execução — um alarme por horário —, e esquecer o que já foi
 * aberto é justamente o defeito que ele evita.
 */
const jaAbertos = new Set<string>();

async function tratar(evento: Event): Promise<void> {
  const notificacao = evento.detail.notification;
  const id = notificacao?.id;
  if (notificacao === undefined || id === undefined) return;

  const dados = lerDadosDoAviso(notificacao.data);
  if (dados === null) return;

  /**
   * **O alarme chegou com o app aberto: o app abre a tela ele mesmo.**
   *
   * O Android rebaixa o `fullScreenAction` para heads-up sempre que a pessoa está usando o celular,
   * e essa decisão é do sistema — a API não deixa forçar. A regra existe para proteger quem está no
   * meio de uma ligação, e faz sentido em geral.
   *
   * Mas aqui ela contraria o que o app existe para fazer. A dose tem hora, e o alarme é justamente
   * o que traz a atenção de volta para a rotina posológica — a alternativa a usar o despertador do
   * celular. Um aviso discreto no topo da tela é exatamente o que se ignora sem perceber.
   *
   * Com o app em primeiro plano existe um caminho que não depende do sistema: navegar. `DELIVERED`
   * chega no instante em que o aviso é mostrado, e daí a própria tela do alarme entra por cima —
   * mesma tela, mesmo som em loop, mesmos botões.
   */
  if (evento.type === EventType.DELIVERED) {
    if (!ehAlarmeDeTelaCheia(id)) return;

    /**
     * Um horário abre a tela **uma vez só**.
     *
     * `DELIVERED` pode chegar mais de uma vez para a mesma notificação — o Notifee reemite ao
     * reentregar o aviso, e o handler de primeiro plano também dispara em algumas transições de
     * estado. Sem esta trava, cada repetição empilharia outra tela de alarme sobre a anterior.
     */
    if (jaAbertos.has(dados.scheduledFor)) return;

    /**
     * **A dose já respondida não reabre o alarme** — e este é o caminho do lampejo azul.
     *
     * Visto em aparelho em 09/09, e a correção anterior (no toque) não o alcançou porque o gatilho
     * não é o toque: é o **reagendamento**. Responder na tela do alarme faz, nesta ordem, gravar o
     * desfecho → `reagendarTodosOsAvisos()` → fechar a tela (ver `responderTodas` em
     * `AlarmeScreen`). O reagendamento cancela tudo e reagenda a partir do banco, e a dose que
     * acabou de ser respondida ainda cai dentro da **tolerância de 2 minutos** que existe para o
     * aviso "que acabou de passar" não se perder (ver `TOLERANCIA_DE_ATRASO_EM_MINUTOS`).
     *
     * O aviso reagendado dispara quase na hora, o `DELIVERED` chega, e o app abre a tela do alarme
     * de novo — que monta, descobre que tudo está resolvido e se fecha sozinha. O lampejo é
     * exatamente essa tela nascendo e morrendo.
     *
     * Ler o banco aqui custa uma consulta por entrega de alarme, o que é raro, e é o que distingue
     * "há dose esperando" de "isto é o eco de uma resposta que já aconteceu".
     */
    if (await todasAsDosesResolvidas(dados.doseScheduleIds)) {
      await notifee.cancelNotification(id).catch(() => {});
      return;
    }

    /**
     * **A Activity nativa já está na frente: não empurra a rota.**
     *
     * Esta é a causa do som duplicado, e sobreviveu a três correções minhas porque eu tratava o
     * toque e o eco em vez do disparo. O `fullScreenAction` monta `AlarmeRaiz` numa Activity, e o
     * `index.js` sobe o app inteiro no **mesmo processo** — então este listener está vivo e recebe
     * o `DELIVERED` do mesmo alarme que acabou de irromper. Sem esta guarda, ele empurrava a rota
     * `/alarme/[instante]` por baixo da Activity: duas telas, dois players de áudio.
     *
     * O `jaAbertos` não cobria isso: ele só sabe o que **este** listener abriu, e a Activity é
     * montada pelo Android, sem passar por aqui. `alarme-em-cena` é o registro que as duas telas
     * compartilham.
     */
    if (jaEstaEmCena(dados.scheduledFor)) return;

    jaAbertos.add(dados.scheduledFor);

    aoDispararAlarme?.(dados.scheduledFor);
    return;
  }

  if (evento.type !== EventType.ACTION_PRESS && evento.type !== EventType.PRESS) return;

  /**
   * Aviso que não é de dose: o toque **navega** e não responde nada.
   *
   * Sai antes de `tratarRespostaAoAviso` porque não há resposta a tratar — a lista de doses é
   * vazia, e passar por lá só produziria um "abrirHorario" para um horário que não existe.
   */
  const destino = destinoDaChave(dados.chave);
  if (destino !== null) {
    await notifee.cancelNotification(id);
    aoAbrirDestino?.(destino);
    return;
  }

  /**
   * `PRESS` é o toque no **corpo**: leva à tela do horário, onde a resposta parcial cabe ("tomei
   * este, aquele não"). Nos botões, o `pressAction.id` diz qual foi.
   */
  const acao =
    evento.type === EventType.PRESS ? "" : (evento.detail.pressAction?.id ?? "");

  const resultado = await tratarRespostaAoAviso(acao, dados);

  if (resultado.tipo === "abrirHorario") {
    /**
     * **Dose já resolvida não abre tela nenhuma.**
     *
     * Visto em aparelho (09/09): tocar no corpo do alarme abria a tela azul, e ao responder ela
     * piscava — aparecia e sumia. A sequência era essa: a tela do alarme se fecha sozinha quando
     * todas as doses estão resolvidas (ver `AlarmeScreen`), então abri-la para uma dose que **já**
     * foi respondida produz exatamente um lampejo.
     *
     * Acontece sempre que a resposta chegou por outro caminho antes do toque: pelo botão da própria
     * notificação, pela Home, ou por um segundo toque enquanto a primeira navegação ainda ia. O
     * aviso continua na bandeja depois de respondido — o Android não o remove sozinho —, e é ele
     * que convida ao toque tardio.
     *
     * Ler o banco aqui é o que distingue "ainda há o que responder" de "já foi": `dados` carrega os
     * ids, mas não o desfecho, e o desfecho é o que decide.
     */
    if (await todasAsDosesResolvidas(dados.doseScheduleIds)) {
      await notifee.cancelNotification(id).catch(() => {});
      await dispensarAlarmeAtivo().catch(() => {});
      pedirParaEncerrarAlarme();
      return;
    }

    /**
     * Tocar num **alarme** abre a tela do alarme, e não a do horário.
     *
     * Os dois avisos caem aqui, mas pedem telas diferentes. Com o aparelho em uso o Android rebaixa
     * o alarme para um heads-up, e tocá-lo levava à tela de confirmação — que não tem foto do
     * remédio, nem adiar, nem silenciar. Quem foi interrompido por um despertador perdia justamente
     * o que faz dele um despertador, e ficava com um formulário de "tomou ou não?".
     *
     * A tela do alarme existe como rota (`/alarme/[instante]`) exatamente para este caso: o app
     * abre por conta própria o que o sistema não deixou irromper.
     */
    if (ehAlarmeDeTelaCheia(id)) {
      // Sai da trava do `DELIVERED`: um toque é intenção explícita, e recusá-lo porque a entrega já
      // foi registrada deixaria o toque sem efeito nenhum.
      jaAbertos.delete(dados.scheduledFor);
      aoDispararAlarme?.(dados.scheduledFor);
      return;
    }

    /**
     * A notificação comum leva à tela do horário, onde a resposta parcial cabe.
     *
     * Se houver um alarme tocando em paralelo, ele sai: escolher outro caminho para responder é uma
     * resposta a ele, e continuar berrando enquanto a pessoa decide na outra tela é cobrar algo que
     * ela já foi atender.
     */
    await dispensarAlarmeAtivo().catch(() => {});
    pedirParaEncerrarAlarme();
    aoAbrirHorario?.(resultado.dados);
    return;
  }

  /**
   * Tira o aviso da bandeja **depois** de gravar.
   *
   * No Android a notificação não some sozinha ao tocar num botão de ação: ela fica lá, e cada toque
   * dispara o handler de novo. Foi assim que cinco toques em "Adiar" viraram cinco lembretes, em
   * 29/08. A guarda contra repetição vive em `confirmarDosesDoAviso` — esta linha é a segunda
   * camada, para o aviso não ficar convidando ao toque depois de resolvido.
   */
  if (acao === ACAO_TOMEI || acao === ACAO_PULEI || acao === ACAO_ADIAR) {
    await notifee.cancelNotification(id).catch(() => {});
  }
}

/**
 * Liga os handlers. Chamado uma vez, no bootstrap.
 *
 * São **dois** porque o app pode estar em qualquer estado quando o aviso chega:
 * `onBackgroundEvent` cobre o app fechado ou em segundo plano — que é o caso normal de um alarme de
 * dose —, e `onForegroundEvent` cobre quem estava com o app aberto.
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
 * O evento em segundo plano, registrado **fora do ciclo de vida do React**.
 *
 * Precisa ser chamado no `index.js`, junto do registro do componente de alarme: quando o app está
 * fechado, não há componente montado para assinar nada, e é este handler que grava a dose. Registrar
 * dentro de um `useEffect` faria o botão "Tomei" não funcionar exatamente no caso mais comum — o
 * celular bloqueado, que é para o que o alarme existe.
 */
export function registrarEventosEmSegundoPlano(): void {
  notifee.onBackgroundEvent(tratar);
}

/**
 * A resposta que **abriu** o app, quando ele estava fechado.
 *
 * Continua existindo porque o `onBackgroundEvent` resolve a *escrita*, mas não a *navegação*: quem
 * tocou no corpo de um lembrete com o app fechado precisa chegar na tela do horário, e a rota só
 * existe depois que o app monta.
 */
export async function consultarRespostaDeAbertura(): Promise<
  { tipo: "horario"; dados: DadosDoAviso } | { tipo: "destino"; destino: DestinoDoAviso } | null
> {
  const inicial = await notifee.getInitialNotification();
  if (inicial === null) return null;

  const dados = lerDadosDoAviso(inicial.notification.data);
  if (dados === null) return null;

  /**
   * Estoque, receita e compromisso: o app abre **onde se resolve aquilo**.
   *
   * É o caminho que mais importa dos três, porque é o caso típico — a notificação chega às 00:01,
   * a pessoa vê de manhã com o app fechado, toca, e o app abria na Home. O assunto que a
   * notificação nomeava ficava para ela reencontrar sozinha.
   */
  const destino = destinoDaChave(dados.chave);
  if (destino !== null) return { tipo: "destino", destino };

  // Só o toque no corpo pede navegação. Se veio de um botão, o handler de segundo plano já gravou
  // o que tinha que gravar, e abrir a tela do horário seria mostrar uma dose já resolvida.
  const acao = inicial.pressAction?.id ?? "";
  if (acao === ACAO_TOMEI || acao === ACAO_ADIAR) return null;

  return { tipo: "horario", dados };
}
