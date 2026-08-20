import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  purposeText: {
    ...typography.bodySm,
    color: colors.outline,
  },
  highlightList: {
    gap: spacing.md,
  },
  highlightRow: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    opacity: 0.9,
    padding: spacing.md,
    borderRadius: radius.full,
  },
  highlightTextGroup: {
    flex: 1,
    gap: 5,
  },
  highlightTitle: {
    ...typography.bodyLg,
    color: colors.onPrimary,
  },
  highlightDescription: {
    ...typography.bodySm,
    color: colors.onPrimary,
    opacity: 0.6,
  },
  // Gap menor entre os dois (Termos de Uso / Política de Privacidade) do que o resto da tela —
  // são irmãos do mesmo assunto, faz sentido ficarem visualmente mais próximos um do outro.
  legalSectionsGroup: {
    gap: spacing.sm,
  },
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
  consentGroup: {
    gap: spacing.md,
  },
});
