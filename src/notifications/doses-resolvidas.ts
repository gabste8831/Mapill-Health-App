/**
 * Avisos internos sobre o que aconteceu com uma dose, para quem a estiver mostrando agora.
 *
 * A tela de alarme e a unica que nao pode esperar: enquanto toca, ela afirma que ha resposta
 * pendente, e o som seguir depois de a dose ser resolvida em outro lugar e o app se contradizendo.
 * Ela ja revalida por intervalo, e estes avisos so fecham os segundos entre uma revalidacao e outra.
 *
 * Nada aqui e fonte de verdade: o banco e. Perdendo o aviso, a revalidacao periodica ainda resolve.
 *
 * No modulo, e nao em contexto de React, porque quem age nem sempre e um componente: o handler de
 * segundo plano roda fora da arvore.
 */

type OuvinteDeResolucao = (doseScheduleIds: string[]) => void;
type OuvinteSimples = () => void;

const ouvintesDeResolucao = new Set<OuvinteDeResolucao>();
const ouvintesDeSaida = new Set<OuvinteSimples>();

/** Chama cada ouvinte sem deixar que um quebrado cale os outros - todos têm rede própria. */
function avisar<T>(ouvintes: Set<(dados: T) => void>, dados: T): void {
  for (const ouvinte of ouvintes) {
    try {
      ouvinte(dados);
    } catch {
      // Silencioso de propósito: são telas independentes reagindo ao mesmo fato, e a que falhar
      // ainda tem a revalidação periódica.
    }
  }
}

/** Avisa que estas doses foram resolvidas agora - em qualquer caminho do app. */
export function anunciarDosesResolvidas(doseScheduleIds: string[]): void {
  if (doseScheduleIds.length === 0) return;
  avisar(ouvintesDeResolucao, doseScheduleIds);
}

/** Escuta as resoluções. Devolve a função que cancela a escuta. */
export function ouvirDosesResolvidas(ouvinte: OuvinteDeResolucao): () => void {
  ouvintesDeResolucao.add(ouvinte);
  return () => {
    ouvintesDeResolucao.delete(ouvinte);
  };
}

/**
 * Pede que a tela de alarme saia de cena, sem que nada tenha sido respondido.
 *
 * Acontece quando a pessoa escolhe **outro caminho** para responder: tocar no corpo da notificação
 * leva à tela do horário, e o alarme continuar tocando enquanto ela decide lá é cobrar algo que ela
 * já foi atender. Equivale a ter tocado em "Responder depois" - a dose segue pendente.
 */
export function pedirParaEncerrarAlarme(): void {
  avisar(ouvintesDeSaida, undefined);
}

/** Escuta o pedido de saída. Devolve a função que cancela a escuta. */
export function ouvirPedidoDeEncerrarAlarme(ouvinte: OuvinteSimples): () => void {
  ouvintesDeSaida.add(ouvinte);
  return () => {
    ouvintesDeSaida.delete(ouvinte);
  };
}
