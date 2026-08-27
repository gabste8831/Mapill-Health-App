import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  fileira: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ficha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    // 40 de altura: menor que o alvo de 44 dos botões de ação, porque errar aqui só reordena a
    // lista — é reversível num toque, diferente de confirmar uma dose.
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  fichaSelecionada: {
    backgroundColor: colors.primary,
  },
  rotulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  rotuloSelecionado: {
    color: colors.onPrimary,
  },
});
