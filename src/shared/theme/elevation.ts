import { colors } from "./colors";
import { radius, spacing } from "./spacing";

/**
 * A sombra padrão de uma superfície elevada.
 *
 * **Sombra, e nunca borda.** A decisão é de 21/08 e vale para o app inteiro: o fundo da tela e o
 * cartão são quase da mesma cor, e uma borda de 1px faz o bloco parecer uma caixa desenhada — a
 * gramática de um formulário HTML, que é o que dava às listas o aspecto de planilha. A sombra
 * separa do fundo sem contornar nada.
 *
 * Discreta de propósito. O objetivo é dizer "isto está acima", não empilhar camadas.
 */
export const surfaceShadow = "0px 1px 3px rgba(25, 28, 30, 0.08)";

/** Um pouco mais presente, para o que precisa se destacar entre iguais (o card em foco na Home). */
export const surfaceShadowElevada = "0px 2px 8px rgba(25, 28, 30, 0.10)";

/**
 * O cartão padrão do app: fundo branco, cantos arredondados, sombra e respiro interno.
 *
 * Existe como token, e não como cópia em cada arquivo de estilo, porque foi exatamente a cópia que
 * fez as telas divergirem — sete lugares desenhavam o próprio cartão com borda cinza enquanto o
 * `Card` do kit já usava sombra. Espalhar (`...surfaceCard`) mantém a decisão num lugar só.
 *
 * O `padding` é `gutter` (24) e não `md` (16): é o respiro que separa um cartão que se lê de um
 * cartão que se aperta, e a diferença aparece mais em lista, onde vários se sucedem.
 */
export const surfaceCard = {
  backgroundColor: colors.surfaceContainerLowest,
  borderRadius: radius.lg,
  padding: spacing.gutter,
  boxShadow: surfaceShadow,
} as const;

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
 * Um valor, e não `md` em umas telas e `gutter` em outras — o que faz o conteúdo "pular" de lado
 * ao navegar entre abas, e é o tipo de inconsistência que se sente sem se nomear.
 */
export const screenPadding = spacing.md;
