import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    paddingBottom: spacing.sm,
  },
  paragraph: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
});
