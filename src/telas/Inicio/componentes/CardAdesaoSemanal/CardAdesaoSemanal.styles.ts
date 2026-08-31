import { StyleSheet } from "react-native";

import { colors, spacing, surfaceCard, typography } from "@/shared/theme";

const BAR_ROW_HEIGHT = 80;

export const styles = StyleSheet.create({
  container: {
    ...surfaceCard,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    height: BAR_ROW_HEIGHT,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.2,
  },
  barToday: {
    opacity: 1,
  },
  /** Traço fino de "não havia dose", visualmente distinto de uma barra curta. */
  barVazia: {
    height: 2,
    backgroundColor: colors.outlineVariant,
    borderRadius: 2,
  },
  labelsRow: {
    flexDirection: "row",
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    ...typography.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  summary: {
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
  },
});

export const barRowHeight = BAR_ROW_HEIGHT;
