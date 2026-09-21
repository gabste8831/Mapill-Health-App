import { Easing } from "react-native-reanimated";

/**
 * Como o app se move.
 *
 * Movimento aqui tem uma funcao so: mostrar que algo mudou. Nada se move para enfeitar, porque o
 * app abre na mao de quem tem catarata, tremor, ou pressa por ter esquecido o remedio. Por isso os
 * tempos sao curtos e o gatilho e sempre mudanca de estado real.
 *
 * Quase tudo e `out`, que comeca rapido e desacelera: o elemento parece chegar ao lugar. `in` faz
 * a interface parecer travada, e `inOut` so serve para o que sai e volta.
 */

/** Os tres tempos. Cada animacao escolhendo o proprio numero faz o app perder o compasso. */
export const duracao = {
  /** Resposta imediata: tinta que muda, item que aparece. */
  rapida: 140,
  /** O padrão: barra que cresce, bloco que abre. */
  media: 280,
  /** O que celebra: o check da dose confirmada. Longo o bastante para ser visto sem atrasar. */
  lenta: 420,
} as const;

/** A curva padrão. Desacelera no fim - o elemento chega, não é largado. */
export const curva = Easing.out(Easing.cubic);

/** Para o que precisa de um empurrão extra no começo (o check que "carimba"). */
export const curvaEnfatica = Easing.out(Easing.back(1.4));

/**
 * A preferencia de "reduzir movimento" e lida com `useReducedMotion()` do Reanimated, e nao por um
 * helper daqui: duas formas de responder a mesma pergunta divergem em silencio.
 *
 * O padrao em quem anima: `const semMovimento = useReducedMotion()`, e a duracao vira `0`. Com zero
 * o valor salta para o destino, o estado final continua correto e nada pisca.
 */
