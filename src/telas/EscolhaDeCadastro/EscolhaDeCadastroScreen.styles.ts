import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  /**
   * `flexGrow: 1` faz o conteúdo ocupar pelo menos a altura da tela, e só então o
   * `justifyContent` tem o que centralizar. Centralizar no `safeArea` puxaria o header junto,
   * porque ele é irmão do ScrollView, não filho.
   */
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  options: {
    gap: spacing.md,
  },
  // Respiro extra dentro do Card: são só duas escolhas na tela, e o alvo grande facilita o toque.
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.gutter,
    paddingHorizontal: 12,
  },
  /** Cinza sutil só pra assentar o ícone — a cor fica no próprio ícone, não no fundo. */
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(colors.surfaceContainer, 0.5),
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  optionLabel: {
    ...typography.headlineSmRegular,
    color: colors.onSurface,
  },
  optionDescription: {
    ...typography.bodyMd,
    color: colors.onSecondaryContainer,
    maxWidth: 300,
  },
});
