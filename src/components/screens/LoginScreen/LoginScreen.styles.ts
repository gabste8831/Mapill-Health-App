import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    justifyContent: "center",
    gap: spacing.xl,
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    ...typography.headlineMd,
    color: colors.onPrimary,
  },
  brandTitle: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  brandSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  googleButton: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  googleButtonText: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  footer: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  footerCaption: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    opacity: 0.8,
  },
  continueWithoutLoginButton: {
    paddingVertical: spacing.sm,
  },
  continueWithoutLoginText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
});
