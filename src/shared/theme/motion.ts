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
 * **A preferência de "reduzir movimento" é lida com `useReducedMotion()`**, do Reanimated — não
 * por um helper daqui.
 *
 * Havia um `duracaoRespeitandoMovimento(ms, reduzir)` neste arquivo e um `use-reduzir-movimento`
 * nos hooks, escritos para ser o caminho padrão. Os componentes acabaram usando o hook da
 * biblioteca, que faz o mesmo e já roda na thread de UI — e as duas peças próprias ficaram sem
 * consumidor. Duas formas de responder à mesma pergunta divergem em silêncio; ficou a da lib.
 *
 * O padrão, em quem anima: `const semMovimento = useReducedMotion();` e a duração vira `0`.
 * Com duração zero o valor salta para o destino — o estado final continua correto e nada pisca.
 */
