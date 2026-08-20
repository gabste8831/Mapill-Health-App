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
  label: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
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
