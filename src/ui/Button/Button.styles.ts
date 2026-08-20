import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  /** Mesma lógica do Card: sombra em vez de borda, pra ler como superfície e não como contorno. */
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
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
