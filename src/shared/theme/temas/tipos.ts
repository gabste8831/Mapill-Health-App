import type { colors as paletaPadrao } from "../colors";

/**
 * # O contrato de um tema
 *
 * Um tema é um objeto com **exatamente** as mesmas chaves da paleta padrão (`shared/theme/colors.ts`).
 * O tipo é derivado dela, e não escrito à mão, e isso é a garantia principal desta arquitetura:
 * ao acrescentar uma cor nova na paleta padrão, o TypeScript **quebra a compilação** de todo tema
 * que ainda não a definiu.
 *
 * Ou seja — é impossível esquecer de dar a um tema uma cor que os outros têm. O compilador cobra.
 */
export type PaletaDeTema = { readonly [K in keyof typeof paletaPadrao]: string };

/**
 * Ajustes que **não são cor** mas mudam junto com o tema.
 *
 * Existem porque acessibilidade não se resolve só trocando tinta. No alto contraste, sombra sutil
 * é invisível — o que separa uma superfície da outra ali é contorno. E no modo para daltonismo,
 * o que muda não é a paleta: é a obrigação de repetir em forma e em texto o que a cor diz.
 */
export type AjustesDeTema = {
  /**
   * Desenhar contorno nas superfícies em vez de confiar na sombra.
   *
   * A regra de "sombra e nunca borda" (decisão de 21/08) pressupõe que se enxergue uma sombra de
   * 8% de opacidade. Quem escolheu alto contraste em geral não enxerga — e aí a regra que existia
   * para não parecer planilha passa a esconder onde um cartão termina.
   */
  contornarSuperficies: boolean;
  /**
   * Nunca deixar a cor sozinha carregando um significado: ícone e texto sempre presentes.
   *
   * Vale para o estado da dose (atrasada/agora/tomada), para o estoque baixo e para erro de campo.
   */
  reforcarFormaEIcone: boolean;
  /** Peso tipográfico extra no texto de apoio, que é o primeiro a sumir para vista cansada. */
  textoDeApoioMaisForte: boolean;
};

export type Tema = {
  id: TemaId;
  /** O nome que a pessoa lê em Ajustes. */
  nome: string;
  /** A frase de uma linha que explica para quem o tema serve. */
  descricao: string;
  /** Claro ou escuro — o app usa isto para a barra de status e o teclado do sistema. */
  esquema: "claro" | "escuro";
  cores: PaletaDeTema;
  ajustes: AjustesDeTema;
};

/**
 * Os temas que existem.
 *
 * `padrao` é o tema que o app tem hoje — o azul sobre fundo claro, que é o visual próprio do
 * Mapill. Os outros três são **alternativas de acessibilidade**, não redesenhos: eles preservam a
 * mesma estrutura, os mesmos pesos e as mesmas decisões de layout, e mudam só o que precisa mudar
 * para atender quem não consegue usar o padrão confortavelmente.
 */
export type TemaId = "padrao" | "escuro" | "altoContraste" | "daltonismo";

/**
 * O que fica salvo na preferência da pessoa.
 *
 * `sistema` é diferente de um tema: significa "decida por mim a cada vez", e resolve para `padrao`
 * ou `escuro` conforme o aparelho. Por isso ele vive aqui e não em `TemaId`.
 */
export type PreferenciaDeTema = TemaId | "sistema";
