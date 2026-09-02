import notifee, { EventType, type Event } from "@notifee/react-native";

import { ACAO_TOMEI } from "./acoes";
import { ehAlarmeDeTelaCheia } from "./alarme-em-tela-cheia";
import { confirmarDosesDoAviso } from "./responder-aviso";

/**
 * Responde ao toque no botão **da notificação do alarme** — o caminho que não passa pela tela cheia.
 *
 * ## Por que este caminho existe
 *
 * O `fullScreenAction` abre a tela cheia quando o aparelho está ocioso, mas o Android
 * **deliberadamente** a rebaixa para um heads-up quando a pessoa está usando o celular — roubar a
 * tela de quem está no meio de outra coisa seria pior que avisar. Nesse caso o alarme chega como
 * notificação, com o botão "Tomei", e é aqui que ele é tratado.
 *
 * Sem isto, o botão apareceria e não faria nada — que é pior que não existir, porque ensina a
 * desconfiar dos avisos do app.
 *
 * ## A regra é a mesma dos dois lados
 *
 * `confirmarDosesDoAviso` é a **mesma** função que o `expo-notifications` chama, com a mesma guarda
 * contra confirmação repetida. O que muda é só quem entrega o toque; o que acontece com a dose é
 * decidido num lugar só.
 */
function lerDoseScheduleIds(evento: Event): string[] | null {
  const dados = evento.detail.notification?.data;
  const cru = dados?.doseScheduleIds;
  if (typeof cru !== "string") return null;

  try {
    const lista: unknown = JSON.parse(cru);
    if (!Array.isArray(lista)) return null;
    return lista.filter((item): item is string => typeof item === "string");
  } catch {
    // O dado vem do sistema e pode ser de uma versão antiga do app — uma notificação agendada
    // semana passada sobrevive a uma atualização. Ignorar é melhor que derrubar o handler.
    return null;
  }
}

/** Avisa quem está ouvindo que um alarme foi entregue com o app aberto. */
type AoDisparar = (scheduledFor: string) => void;
let aoDisparar: AoDisparar | null = null;

/**
 * Horários cuja tela já foi aberta nesta execução.
 *
 * Vive no módulo, e não em estado de React, porque os handlers do Notifee também vivem: eles são
 * registrados uma vez e sobrevivem às montagens e desmontagens de tela. Um `Set` em componente
 * seria zerado a cada navegação, e a trava não travaria nada.
 *
 * Não é limpo: são poucas entradas por execução — um alarme por horário —, e esquecer o que já foi
 * aberto é justamente o defeito que ele evita.
 */
const jaAbertos = new Set<string>();

async function tratar(evento: Event): Promise<void> {
  const id = evento.detail.notification?.id;
  if (id === undefined || !ehAlarmeDeTelaCheia(id)) return;

  /**
   * **O alarme chegou com o app aberto: o app abre a tela ele mesmo.**
   *
   * O Android rebaixa o `fullScreenAction` para heads-up sempre que a pessoa está usando o celular,
   * e essa decisão é do sistema — a API de notificação não deixa forçar. A regra existe para
   * proteger quem está no meio de uma ligação, e faz sentido em geral.
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
    const scheduledFor = evento.detail.notification?.data?.scheduledFor;
    if (typeof scheduledFor !== "string") return;

    /**
     * Um horário abre a tela **uma vez só**.
     *
     * `DELIVERED` pode chegar mais de uma vez para a mesma notificação — o Notifee reemite ao
     * reentregar o aviso, e o handler de primeiro plano também dispara em algumas transições de
     * estado. Sem esta trava, cada repetição empilharia outra tela de alarme por cima da anterior,
     * e a pessoa teria de fechar várias para voltar ao que estava fazendo.
     */
    if (jaAbertos.has(scheduledFor)) return;
    jaAbertos.add(scheduledFor);

    aoDisparar?.(scheduledFor);
    return;
  }

  if (evento.type !== EventType.ACTION_PRESS) return;
  if (evento.detail.pressAction?.id !== ACAO_TOMEI) return;

  const doseScheduleIds = lerDoseScheduleIds(evento);
  if (doseScheduleIds === null || doseScheduleIds.length === 0) return;

  await confirmarDosesDoAviso(doseScheduleIds);

  /**
   * Tira o aviso da bandeja **depois** de gravar.
   *
   * No Android a notificação não some sozinha ao tocar num botão de ação: ela fica lá, e cada toque
   * dispara o handler de novo. Foi assim que cinco toques em "Adiar" viraram cinco lembretes, em
   * 29/08. A guarda contra repetição vive em `confirmarDosesDoAviso` — esta linha é a segunda
   * camada, para o aviso não ficar convidando ao toque depois de resolvido.
   */
  await notifee.cancelNotification(id);
}

/**
 * Liga os dois handlers do Notifee. Chamado uma vez, no bootstrap.
 *
 * São **dois** porque o app pode estar em qualquer estado quando o alarme dispara:
 * `onBackgroundEvent` cobre o app fechado ou em segundo plano — que é o caso normal de um alarme de
 * dose —, e `onForegroundEvent` cobre quem estava com o app aberto.
 */
export function escutarAlarmeDeTelaCheia(abrirAlarme: AoDisparar): () => void {
  aoDisparar = abrirAlarme;

  notifee.onBackgroundEvent(tratar);
  const parar = notifee.onForegroundEvent((evento) => void tratar(evento));

  return () => {
    aoDisparar = null;
    parar();
  };
}
