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

/** Altura da barra de abas — o conteúdo rolável precisa reservar isso no fim pra não ficar sob ela. */
export const bottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Radius sutil e "clínico" do protótipo — bem mais discreto que arredondamentos genéricos. */
export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
  full: 12,
} as const;
