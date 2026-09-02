import type { StyleProp, ViewStyle } from "react-native";

import { colors } from "./colors";

/**
 * Como o app responde ao dedo.
 *
 * ## Por que isto existe
 *
 * Até 02/09 **nada no app respondia ao toque**: 75 `Pressable` e nenhum `pressed`, nenhum
 * `android_ripple`. O sintoma não era feio, era pior — um app que não confirma o toque ensina a
 * duvidar se o toque funcionou. E num público que já duvida da própria memória, a resposta a essa
 * dúvida é **tocar de novo**: no botão de confirmar dose, isso registrava duas vezes.
 *
 * Ou seja, feedback de toque aqui não é enfeite: é a primeira camada da mesma proteção que a guarda
 * de idempotência em `confirmarDosesDoAviso` faz no banco.
 *
 * ## Por que opacidade e escala, e não ripple
 *
 * O `ripple` do Android é de uma plataforma só (e o projeto mantém irmãos `.ios.tsx`), e exige
 * `overflow: hidden` para respeitar canto arredondado — o que apagaria as sombras dos cartões.
 * `Pressable` já entrega o estado `pressed` de graça, nas duas plataformas, sem worklet e sem
 * biblioteca.
 *
 * O `reanimated` está instalado, mas para um toggle de opacidade seria peso sem ganho: a diferença
 * entre uma transição de 100ms e uma troca imediata, no tempo de um toque, ninguém percebe. Ele
 * fica guardado para onde ganha de verdade — a barra de progresso que cresce.
 */

/** Superfície colorida cheia (botão primário, chip selecionado, cartão azul) escurece ao toque. */
export const pressedOpacity = 0.85;

/**
 * O fundo que aparece sob um alvo transparente — é o que faz um ícone solto virar botão no
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
  /** Encolhe ao toque. Ligar só em alvo autocontido — ver `pressedScale`. */
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
