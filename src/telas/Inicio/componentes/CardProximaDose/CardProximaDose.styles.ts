import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    ...typography.label,
    color: colors.onPrimary,
    opacity: 0.7,
  },
  time: {
    ...typography.headlineXlBold,
    color: colors.onPrimary,
  },
  medication: {
    ...typography.bodyLg,
    color: colors.onPrimary,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.onPrimary, 0.2),
  },
  hintText: {
    ...typography.label,
    textTransform: "none",
    color: colors.onPrimary,
    opacity: 0.85,
  },
});
