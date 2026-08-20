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
  statusList: {
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  statusValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  statusText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  statusHint: {
    ...typography.bodyMd,
    color: colors.outline,
  },
});
