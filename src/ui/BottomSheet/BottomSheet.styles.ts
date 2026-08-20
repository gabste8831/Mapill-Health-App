import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(25, 28, 30, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
});
