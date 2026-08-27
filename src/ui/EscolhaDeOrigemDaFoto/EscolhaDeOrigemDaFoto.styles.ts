import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  body: {
    gap: spacing.sm,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    // 64 dá folga de dedo numa escolha que é feita uma vez e não pode errar de linha.
    minHeight: 64,
  },
  texto: {
    flex: 1,
  },
  rotulo: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  dica: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
