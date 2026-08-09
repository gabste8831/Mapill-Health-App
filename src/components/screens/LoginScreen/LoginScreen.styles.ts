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
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  input: {
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggle: {
    position: "absolute",
    right: spacing.md,
    padding: spacing.xs,
  },
  passwordToggleText: {
    ...typography.label,
    color: colors.primary,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onPrimary,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
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
