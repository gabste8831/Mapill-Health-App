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
  consentGroup: {
    gap: spacing.md,
  },
});
