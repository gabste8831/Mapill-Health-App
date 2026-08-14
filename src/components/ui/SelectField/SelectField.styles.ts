import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  // Mesmo espaçamento label→conteúdo do TextField e das labels soltas em Card — um só ritmo
  // em toda a tela de formulário (ver TextField.styles.ts).
  fieldGroup: {
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  selectField: {
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectFieldValue: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  selectFieldPlaceholder: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  modalOptionText: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  modalOptionTextSelected: {
    ...typography.bodyLg,
    color: colors.primary,
  },
  modalOptionTextMuted: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
});
