import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    height: 52,
    // borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  text: {
    backgroundColor: "transparent",
    height: "auto",
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.headlineSm,
    fontSize: 16,
  },
  primaryLabel: {
    color: colors.onPrimary,
  },
  outlineLabel: {
    color: colors.onSurface,
  },
  textLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
});
