import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /** `minHeight`: com altura travada, a chip recorta o próprio texto em fonte ampliada. */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    minHeight: 40,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
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
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRemoveText: {
    ...typography.label,
    color: colors.error,
    fontSize: 14,
  },
});
