import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  section: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 52,
  },
  sectionAzul: {
    backgroundColor: colors.primary,
  },
  headerText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  headerTextAzul: {
    color: colors.onPrimary,
  },
  /** Afordância secundária: o título é que carrega a informação, isto só convida ao toque. */
  toggleLabel: {
    ...typography.bodyMd,
    color: colors.primary,
    opacity: 0.7,
  },
  bodyClip: {
    overflow: "hidden",
  },
  bodyMeasure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.md,
  },
});
