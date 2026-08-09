import { StyleSheet } from "react-native";

import { BottomTabInset } from "@/constants/theme";
import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: BottomTabInset + spacing.xxl,
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
  weekSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  weekDay: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.unit,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  weekDayActive: {
    backgroundColor: colors.primary,
  },
  weekDayLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  weekDayNumber: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  weekDayLabelActive: {
    color: colors.onPrimary,
  },
  doseList: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  manageStockButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  manageStockButtonText: {
    ...typography.label,
    color: colors.onPrimary,
  },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: BottomTabInset + spacing.md,
    width: 56,
    height: 56,
    borderRadius: radius.full * 2,
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
