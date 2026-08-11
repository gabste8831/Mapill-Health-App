import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    // borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
});
