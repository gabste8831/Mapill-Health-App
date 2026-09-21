import type { StyleProp, ViewStyle } from "react-native";

import { colors } from "./colors";

/**
 * Como o app responde ao dedo.
 *
 * Nao e enfeite: um app que nao confirma o toque ensina a duvidar se ele funcionou, e num publico
 * que ja duvida da propria memoria a resposta e tocar de novo - no botao de confirmar dose, isso
 * registrava duas vezes. E a primeira camada da mesma protecao que a guarda de idempotencia faz no
 * banco.
 *
 * Opacidade e escala, e nao ripple: aquele e de uma plataforma so e exige `overflow: hidden` para
 * respeitar canto arredondado, o que apagaria as sombras dos cartoes.
 */

/** Superfície colorida cheia (botão primário, chip selecionado, cartão azul) escurece ao toque. */
export const pressedOpacity = 0.85;

/**
 * O fundo que aparece sob um alvo transparente - é o que faz um ícone solto virar botão no
 * instante do toque, sem precisar de fundo permanente.
 */
export const pressedSurface = colors.surfaceContainer;

/**
 * Encolhe **só alvos autocontidos**: botão, ícone, chip, FAB.
 *
 * ⚠️ Nunca em linha de largura total. Escalar uma linha que ocupa a tela inteira faz o texto ao
 * redor parecer tremer, e o efeito lê como falha de renderização em vez de resposta ao toque.
 */
export const pressedScale = 0.97;

export type EstadoDePressaoOpcoes = {
  /** Encolhe ao toque. Ligar só em alvo autocontido - ver `pressedScale`. */
  escala?: boolean;
  /** Escurece por opacidade. O padrão para o que já tem cor de fundo. */
  opacidade?: boolean;
  /** Pinta um fundo ao toque. O padrão para alvo sem fundo próprio. */
  superficie?: boolean;
};

/**
 * Monta o `style` de um `Pressable` a partir do estilo base.
 *
 * Devolve a forma funcional que o `Pressable` aceita, então o componente não repete a lógica de
 * pressionado nem esquece de mesclar o estilo que veio de fora.
 */
export function estadoDePressao(
  base: StyleProp<ViewStyle>,
  { escala = false, opacidade = true, superficie = false }: EstadoDePressaoOpcoes = {},
) {
  return ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => [
    base,
    pressed && {
      ...(opacidade ? { opacity: pressedOpacity } : {}),
      ...(escala ? { transform: [{ scale: pressedScale }] } : {}),
      ...(superficie ? { backgroundColor: pressedSurface } : {}),
    },
  ];
}
