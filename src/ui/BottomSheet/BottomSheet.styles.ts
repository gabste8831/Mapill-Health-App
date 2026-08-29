import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(25, 28, 30, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  /**
   * O respiro de baixo fica aqui, e não no `sheet`: com o padding no container, o conteúdo rolado
   * encostaria na borda do popup em vez de terminar antes dela. O valor vem do componente, que soma
   * a safe area do aparelho — ver `respiroInferior`.
   */
  scrollContent: {
    paddingBottom: spacing.md,
  },
});
