import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  infoBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoBannerText: {
    ...typography.bodyMd,
    color: colors.onSecondaryContainer,
    flex: 1,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.full * 3,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  photoAddLabel: {
    ...typography.label,
    color: colors.primary,
  },
  section: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
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
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  multilineInput: {
    height: 96,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  bloodTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  bloodTypeChip: {
    minWidth: 56,
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodTypeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bloodTypeChipText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  bloodTypeChipTextSelected: {
    color: colors.onPrimary,
  },
  allergyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  allergyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  allergyChipText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  allergyChipRemove: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  allergyChipRemoveText: {
    ...typography.label,
    color: colors.error,
    fontSize: 14,
  },
  allergyInputRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  allergyInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  allergyAddButton: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  allergyAddButtonText: {
    ...typography.label,
    color: colors.primary,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onPrimary,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
});
