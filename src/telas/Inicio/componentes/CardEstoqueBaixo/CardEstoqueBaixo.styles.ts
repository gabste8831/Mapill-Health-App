import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.onError,
    opacity: 0.85,
  },
  medicationName: {
    ...typography.headlineMd,
    color: colors.onError,
  },
  daysRemaining: {
    ...typography.bodyMd,
    color: colors.onError,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: colors.onError,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    ...typography.label,
    color: colors.error,
  },
  secondaryButton: {
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.label,
    color: colors.onError,
    opacity: 0.85,
  },
});
