import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.lg,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
    textAlign: "center",
  },
  options: {
    gap: spacing.sm,
  },
});
