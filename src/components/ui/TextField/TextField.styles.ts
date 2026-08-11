import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  // Mesmo espaçamento label→conteúdo usado nas labels soltas dentro de Card (ex: "ALERGIAS",
  // "CONTATO DE EMERGÊNCIA" em PatientProfileScreen) — um só ritmo em toda a tela de formulário.
  fieldGroup: {
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  requiredMark: {
    color: colors.error,
  },
  input: {
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    // borderRadius: radius.md,
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
