import type { TextStyle } from "react-native";

/**
 * Fonte: Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`, carregada em
 * `src/app/_layout.tsx`). Pesos leves (300) só em telas de apresentação — texto que
 * carrega informação clínica (dose, horário, nome do medicamento) usa sempre 500+,
 * priorizando legibilidade pro público idoso/polimedicado sobre a estética editorial.
 */
export const typography: Record<string, TextStyle> = {
  headlineXl: {
    fontFamily: "PlusJakartaSans_300Light",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  headlineMd: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineSm: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  /**
   * Mesmo tamanho do `headlineSm`, em peso normal. Em 18px a Plus Jakarta fica encorpada demais
   * em semibold — este é o título de item que não precisa disputar atenção, como o rótulo dos
   * cards de escolha.
   */
  headlineSmRegular: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 16,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  /**
   * Texto de apoio pequeno — mensagem de erro, dica sob um número, princípio ativo numa sugestão.
   *
   * **Não é o `label` menor.** `label` é rótulo: vem em caixa alta, com espaçamento entre letras, e
   * serve para nomear uma seção. Isto aqui é frase, e frase em caixa alta se lê mais devagar.
   *
   * Nasceu tarde: sete lugares faziam `...bodyMd, fontSize: 12` porque não havia onde pegar isto
   * pronto, e dois arquivos chegaram a escrever `...typography.bodySm` — que **não existia**, e
   * espalhar `undefined` não dá erro: os dois textos herdavam a fonte do sistema em vez da Plus
   * Jakarta, em silêncio.
   */
  bodySm: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  /**
   * O degrau abaixo do `label`: selo e legenda — "ATRASADA", "OBRIGATÓRIO", as iniciais dos dias
   * sob as barras da semana.
   *
   * Dez lugares já escreviam `...label, fontSize: 10`, ou seja, o token existia de fato e só não
   * tinha nome. Formalizá-lo documenta que a escala tem esse degrau e para de convidar a
   * sobrescrita — que é como o 10 vira 9 em algum canto e ninguém percebe.
   */
  caption: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // Variante "peso forte" pra informação crítica (dose, horário) mesmo em contextos
  // onde o resto da tela usa peso leve (ex: "14:30" dentro do card de headline leve).
  headlineXlBold: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  // Comfortaa (`@expo-google-fonts/comfortaa`) é a fonte da wordmark "Mapill" — reservada
  // pra marca/logo, nunca pro resto da UI (formulários, listas, texto corrido).
  brandWordmark: {
    fontFamily: "Comfortaa_700Bold",
    fontSize: 32,
    lineHeight: 40,
  },
};
