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
  requiredMark: {
    color: colors.error,
  },
  /**
   * `minHeight`, e não `height`: com a altura travada o texto digitado é recortado quando a fonte
   * do sistema está ampliada — e é o público deste app que mais usa esse ajuste do Android.
   */
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldErrorText: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.error,
  },
});
