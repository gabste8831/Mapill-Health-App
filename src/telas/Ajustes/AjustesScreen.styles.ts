import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    // Alvo de toque generoso: o público-alvo inclui idosos, e a linha inteira é clicável.
    minHeight: 56,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  rowLabelDestructive: {
    color: colors.error,
  },
  rowHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
