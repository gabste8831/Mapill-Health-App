/**
 * Paleta Material 3 extraída dos protótipos HTML reais recebidos em 2026-08-09
 * (Home/Dashboard, Escanear código, Cadastro manual). Ver `styling.md` para o
 * detalhamento de onde cada role é usado.
 */
export const colors = {
  primary: "#0057BF",
  onPrimary: "#FFFFFF",
  primaryContainer: "#026FEF",
  onPrimaryContainer: "#FEFCFF",

  secondary: "#545F73",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D5E0F8",
  onSecondaryContainer: "#586377",

  tertiary: "#994200",
  tertiaryContainer: "#C05400",
  onTertiaryContainer: "#FFFBFF",

  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",

  background: "#F7F9FB",
  onBackground: "#191C1E",
  surface: "#F7F9FB",
  surfaceBright: "#F7F9FB",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F4F6",
  surfaceContainer: "#ECEEF0",
  surfaceContainerHigh: "#E6E8EA",
  onSurface: "#191C1E",
  onSurfaceVariant: "#414754",

  outline: "#727786",
  outlineVariant: "#C1C6D7",
} as const;

export type ColorToken = keyof typeof colors;
