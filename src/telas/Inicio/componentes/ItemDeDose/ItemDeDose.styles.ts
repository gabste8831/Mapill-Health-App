import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  done: {
    opacity: 0.5,
  },
  timeColumn: {
    minWidth: 64,
  },
  time: {
    ...typography.label,
    textTransform: "none",
    fontSize: 16,
    color: colors.onSurface,
  },
  statusLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.primary,
  },
  statusLabelUpcoming: {
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  medicationName: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
  },
  medicationNameDone: {
    textDecorationLine: "line-through",
  },
  note: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  confirmButtonText: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
