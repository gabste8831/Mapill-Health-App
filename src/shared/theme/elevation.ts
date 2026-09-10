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
 * O par **sombra ou contorno**, para qualquer superfície que não seja o cartão inteiro.
 *
 * `superficieDeCartao` já resolvia isso para o cartão, mas ele traz junto `borderRadius`, `padding`
 * e cor de fundo — o que serve ao cartão e atrapalha a pílula da busca, um botão de contorno ou
 * uma linha de menu, que têm forma própria. Este devolve **só** a fronteira, e é o que permite a
 * mesma regra alcançar tudo o mais.
 *
 * ## Por que a fronteira é a linguagem do alto contraste
 *
 * A regra do app é sombra e nunca borda (21/08), e ela pressupõe enxergar 8% de opacidade. Quem
 * escolheu alto contraste não enxerga: ali a sombra não é discrição, é a fronteira **apagada**. Um
 * campo de busca sem contorno vira uma faixa branca sobre fundo branco, e nada diz onde tocar.
 *
 * `intensidade` existe porque nem toda superfície pede a mesma ênfase, e ela muda **as duas coisas**
 * — espessura e tom:
 *
 * - `1` é a fronteira que apenas delimita: 1px em `outlineVariant`, para o que já tem fundo próprio
 *   ou forma reconhecível (o cartão, a pílula da busca). 4.31:1 sobre a superfície tingida do alto
 *   contraste, folgado nos 3:1 que a WCAG pede de elemento gráfico.
 * - `2` é a fronteira que **chama**: 2px em `outline`, para o que precisa ser encontrado de relance
 *   e não tem outra pista de que é tocável — o botão de contorno, que sem ela é texto sobre branco.
 *
 * Somar as duas ênfases onde uma basta engorda a peça a ponto de ela pesar mais que o conteúdo: foi
 * o que aconteceu com a busca em 2px, que passou a disputar atenção com a lista que ela filtra.
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
 * O cartão padrão do app: fundo branco, cantos arredondados, sombra e respiro interno.
 *
 * Existe como token, e não como cópia em cada arquivo de estilo, porque foi exatamente a cópia que
 * fez as telas divergirem — sete lugares desenhavam o próprio cartão com borda cinza enquanto o
 * `Card` do kit já usava sombra. Espalhar (`...surfaceCard`) mantém a decisão num lugar só.
 *
 * O `padding` é `gutter` (24) e não `md` (16): é o respiro que separa um cartão que se lê de um
 * cartão que se aperta, e a diferença aparece mais em lista, onde vários se sucedem.
 *
 * Reativa ao tema: no alto contraste a sombra é invisível, então o contorno assume o papel dela.
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
 * A versão estática, para os arquivos que ainda não foram migrados para temas.
 *
 * Ela lê a paleta padrão uma vez, na importação — ou seja, **não responde a troca de tema**. É o
 * andaime da migração gradual: enquanto uma tela ainda a usa, ela funciona no tema padrão em vez
 * de quebrar. `node scripts/tema-pendente.mjs` lista quem ainda depende disto.
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
 * Um valor, e não `md` em umas telas e `gutter` em outras — o que fazia o conteúdo "pular" de lado
 * ao navegar entre abas, e é o tipo de inconsistência que se sente sem se nomear.
 */
export const screenPadding = spacing.md;
