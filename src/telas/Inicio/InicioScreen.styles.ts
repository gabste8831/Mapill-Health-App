import { StyleSheet } from "react-native";

import { bottomTabInset, colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  greetingRow: {
    gap: spacing.md,
  },
  greetingText: {
    gap: spacing.xs,
  },
  dateLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  greeting: {
    ...typography.headlineXl,
    color: colors.onSurface,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  progressLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  progressValue: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progressCaption: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  doseList: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: bottomTabInset + spacing.md,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabIcon: {
    color: colors.onPrimary,
    fontSize: 28,
    lineHeight: 28,
  },
});
