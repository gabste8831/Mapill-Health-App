/**
 * Avisos internos sobre o que aconteceu com uma dose, para quem estiver mostrando ela agora.
 *
 * ## Por que existe
 *
 * A tela de alarme é a única do app que **não** pode esperar. Ela toca em loop, e enquanto tocar
 * está afirmando que há uma resposta pendente — se a dose for resolvida em outro lugar, ou se a
 * pessoa escolher outro caminho para responder, o som continuar é o app contradizendo o que ele
 * mesmo acabou de fazer.
 *
 * Ela revalida sozinha a cada poucos segundos, e isso cobre o caso geral. Mas "poucos segundos" de
 * alarme tocando depois de respondido lê como defeito — foi exatamente o relato do teste de 05/09.
 * Estes avisos fecham essa janela: quem age avisa, e quem está tocando reage na hora.
 *
 * ## Por que não é um estado global de verdade
 *
 * Nada aqui é fonte de verdade — o banco é. Isto é só um empurrão para reagir antes do próximo
 * intervalo. Se o aviso se perder (a tela montou depois do fato, por exemplo), a revalidação
 * periódica ainda resolve; o custo é voltar aos poucos segundos de atraso, e não um estado errado.
 *
 * Vive no módulo, e não em contexto de React, porque quem age nem sempre é um componente: o handler
 * de segundo plano do Notifee roda fora da árvore.
 */

type OuvinteDeResolucao = (doseScheduleIds: string[]) => void;
type OuvinteSimples = () => void;

const ouvintesDeResolucao = new Set<OuvinteDeResolucao>();
const ouvintesDeSaida = new Set<OuvinteSimples>();

/** Chama cada ouvinte sem deixar que um quebrado cale os outros — todos têm rede própria. */
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

/** Avisa que estas doses foram resolvidas agora — em qualquer caminho do app. */
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
 * já foi atender. Equivale a ter tocado em "Responder depois" — a dose segue pendente.
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
