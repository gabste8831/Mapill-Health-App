import { colors } from "./colors";
import type { AjustesDeTema, PaletaDeTema } from "./temas/tipos";
import { radius, spacing } from "./spacing";

/**
 * A sombra padrão de uma superfície elevada.
 *
 * Sombra, e nunca borda: vale para o app inteiro. O fundo e o cartão são quase da mesma cor, e uma
 * borda de 1px faz o bloco parecer caixa desenhada de formulário HTML.
 */
export const surfaceShadow = "0px 1px 3px rgba(25, 28, 30, 0.08)";

/** Um pouco mais presente, para o que precisa se destacar entre iguais (o card em foco na Home). */
export const surfaceShadowElevada = "0px 2px 8px rgba(25, 28, 30, 0.10)";

/**
 * O que flutua sobre o conteúdo, hoje só o FAB. Mais forte que as de cima porque precisa se separar
 * de qualquer coisa que role por baixo, inclusive de outro cartão branco.
 */
export const surfaceShadowFlutuante = "0px 4px 8px rgba(25, 28, 30, 0.20)";

/**
 * O par sombra ou contorno, para superficie que nao e o cartao inteiro.
 *
 * A regra do app e sombra e nunca borda, e ela pressupoe enxergar 8% de opacidade. Quem escolheu
 * alto contraste nao enxerga: ali a sombra nao e discricao, e a fronteira apagada, e um campo de
 * busca vira faixa branca sobre fundo branco.
 *
 * `intensidade` muda espessura e tom: `1` apenas delimita o que ja tem forma reconhecivel, `2`
 * chama o que precisa ser encontrado de relance e nao tem outra pista de que e tocavel. Somar as
 * duas onde uma basta faz a peca pesar mais que o conteudo.
 */
export function fronteiraDeSuperficie(
  cores: PaletaDeTema,
  ajustes?: AjustesDeTema,
  intensidade: 1 | 2 = 1,
) {
  if (!ajustes?.contornarSuperficies) return { boxShadow: surfaceShadow };
  return intensidade === 2
    ? { borderWidth: 2, borderColor: cores.outline }
    : { borderWidth: 1, borderColor: cores.outlineVariant };
}

/**
 * O cartao padrao do app: fundo, cantos, sombra e respiro interno.
 *
 * Token e nao copia em cada folha, porque foi a copia que fez sete telas divergirem, desenhando o
 * proprio cartao com borda cinza enquanto o `Card` do kit ja usava sombra.
 *
 * Reativa ao tema: no alto contraste a sombra e invisivel, e o contorno assume o papel dela.
 */
export function superficieDeCartao(cores: PaletaDeTema, ajustes?: AjustesDeTema) {
  return {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.gutter,
    ...(ajustes?.contornarSuperficies
      ? { borderWidth: 1, borderColor: cores.outlineVariant }
      : { boxShadow: surfaceShadow }),
  } as const;
}

/**
 * A versao estatica, para o que ainda nao foi migrado para temas.
 *
 * Le a paleta uma vez na importacao, entao nao responde a troca de tema. `node
 * scripts/tema-pendente.mjs` lista quem ainda depende disto.
 */
export const surfaceCard = superficieDeCartao(colors);

/**
 * O respiro entre itens de uma lista.
 *
 * Maior que o `gap` de dentro do cartão de propósito: o olho precisa distinguir "onde um item
 * termina" de "onde uma informação termina dentro dele". Com o mesmo valor nos dois, uma lista de
 * cartões vira um bloco só de texto.
 */
export const listGap = spacing.md;

/**
 * A margem lateral de toda tela de conteúdo.
 *
 * Um valor, e não `md` em umas telas e `gutter` em outras - o que fazia o conteúdo "pular" de lado
 * ao navegar entre abas, e é o tipo de inconsistência que se sente sem se nomear.
 */
export const screenPadding = spacing.md;
