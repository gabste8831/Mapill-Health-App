import { Easing } from "react-native-reanimated";

/**
 * # Como o app se move
 *
 * ## A regra
 *
 * Movimento aqui tem uma função só: **mostrar que algo mudou**. A barra que cresce diz "seu dia
 * avançou"; o check que aparece diz "ficou registrado". Nada se move para enfeitar.
 *
 * Isto não é purismo — é o público. Este app abre na mão de quem tem catarata, tremor, ou está
 * com pressa porque esqueceu o remédio. Animação que atrasa uma confirmação de dose é atrito num
 * fluxo que precisa ser instantâneo, e animação que se repete a cada rolagem vira ruído que ensina
 * a ignorar a tela. Por isso os tempos são curtos e o gatilho é sempre uma mudança de estado real.
 *
 * ## Por que quase tudo é `out`
 *
 * Uma curva `out` começa rápida e desacelera no fim: o elemento parece chegar ao lugar por conta
 * própria, com peso. `in` (começa devagar) faz a interface parecer travada, e `inOut` só serve
 * para o que sai *e* volta.
 */

/**
 * Os três tempos. Não há um quarto — quando cada animação escolhe o próprio número, o app perde o
 * compasso e a interface parece feita por pessoas diferentes.
 */
export const duracao = {
  /** Resposta imediata: tinta que muda, item que aparece. */
  rapida: 140,
  /** O padrão: barra que cresce, bloco que abre. */
  media: 280,
  /** O que celebra: o check da dose confirmada. Longo o bastante para ser visto sem atrasar. */
  lenta: 420,
} as const;

/** A curva padrão. Desacelera no fim — o elemento chega, não é largado. */
export const curva = Easing.out(Easing.cubic);

/** Para o que precisa de um empurrão extra no começo (o check que "carimba"). */
export const curvaEnfatica = Easing.out(Easing.back(1.4));

/**
 * O tempo de uma animação, **respeitando a preferência de "reduzir movimento"** do sistema.
 *
 * Devolve `0` quando a pessoa pediu menos movimento: com duração zero o valor salta direto para
 * o destino, então o estado final continua correto e nada pisca — o código que anima não precisa
 * de um caminho alternativo.
 *
 * Por que zerar em vez de simplesmente não animar: quem liga "reduzir movimento" costuma fazê-lo
 * por enjoo vestibular ou por distração — para essas pessoas, o movimento não é neutro, é sintoma.
 * Ignorar a preferência do sistema é sobrepor o gosto do app à necessidade de quem usa.
 */
export function duracaoRespeitandoMovimento(ms: number, reduzirMovimento: boolean): number {
  return reduzirMovimento ? 0 : ms;
}
