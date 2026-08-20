import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  accordionSection: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  accordionHeaderText: {
    ...typography.headlineSm,
    fontSize: 15,
    color: colors.onSurface,
  },
  accordionContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  accordionSectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    paddingBottom: spacing.sm,
  },
  accordionParagraph: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
});
