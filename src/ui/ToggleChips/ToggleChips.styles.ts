import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  /**
   * Embrulha na largura que tiver. Diferente do `OptionGroup`, aqui a chip tem o tamanho do seu
   * texto e não o da coluna: a lista é de tamanhos irregulares ("Em jejum", "Com bastante água")
   * e esticar todas pro mesmo tamanho gastaria altura sem ganhar leitura.
   */
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
});
