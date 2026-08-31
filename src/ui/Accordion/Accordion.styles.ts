import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Cinza claro, e não branco. O acordeão costuma morar dentro de um `Card` branco, e branco
   * sobre branco deixava só a sombra fininha dizendo que ali tem algo clicável, o que some
   * dependendo da tela.
   */
  section: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
    boxShadow: surfaceShadow,
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
