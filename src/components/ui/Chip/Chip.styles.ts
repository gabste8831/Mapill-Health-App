import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    height: 36,
    // borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  chipRemove: {
    width: 20,
    height: 20,
    // borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRemoveText: {
    ...typography.label,
    color: colors.error,
    fontSize: 14,
  },
});
