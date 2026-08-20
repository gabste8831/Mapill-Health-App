import { Platform } from "react-native";

export const spacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  gutter: 24,
  lg: 32,
  xl: 48,
  xxl: 80,
} as const;

export const marginMobile = spacing.md;

/**
 * Distância da label até o campo dela (e do campo até a mensagem de erro). Um único valor pra
 * todo formulário — TextField, SelectField e as labels soltas dentro de Card usam este token,
 * senão o ritmo da tela desalinha conforme cada um é ajustado em separado.
 */
export const fieldLabelGap = spacing.sm;

/** Altura da barra de abas — o conteúdo rolável precisa reservar isso no fim pra não ficar sob ela. */
export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/**
 * Meio-termo entre o "clínico" dos protótipos (cantos quase retos) e o arredondado de app de
 * consumo. Canto quase reto somado a borda de 1px é a gramática visual de um formulário HTML —
 * é o que fazia as telas de lista parecerem planilha.
 *
 * `full` é círculo/pílula de verdade: usar direto, sem multiplicar. Botão usa `lg`, não `full`,
 * pra ficar no mesmo idioma dos cards em vez de virar pílula.
 */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;
