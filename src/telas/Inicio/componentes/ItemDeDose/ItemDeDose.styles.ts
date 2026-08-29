import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  /**
   * Atrasada usa a cor de erro, e não a de atenção: é a única linha da agenda que representa algo
   * que já deveria ter acontecido e não aconteceu (decisão nº11.5 — ela nunca se resolve sozinha,
   * então precisa continuar pedindo resposta).
   */
  late: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
  },
  /**
   * "É agora" ganha o mesmo peso de borda da atrasada, e não o da próxima: as duas pedem ação
   * imediata, e é essa diferença — pede agora × está na fila — que a espessura precisa carregar.
   * O que separa uma da outra é a cor, verde contra vermelho, que é o que você pediu no 12.1.
   */
  now: {
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: colors.successContainer,
  },
  done: {
    opacity: 0.5,
  },
  timeColumn: {
    minWidth: 64,
  },
  time: {
    ...typography.label,
    textTransform: "none",
    fontSize: 16,
    color: colors.onSurface,
  },
  statusLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.primary,
  },
  statusLabelUpcoming: {
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  statusLabelNow: {
    color: colors.onSuccessContainer,
  },
  statusLabelLate: {
    color: colors.onErrorContainer,
  },
  content: {
    flex: 1,
  },
  medicationName: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
  },
  /** Só a pulada é riscada: a tomada não é uma tarefa cancelada, é uma tarefa cumprida. */
  medicationNameSkipped: {
    textDecorationLine: "line-through",
  },
  note: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  actions: {
    gap: spacing.xs,
    alignItems: "stretch",
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  confirmButtonText: {
    ...typography.label,
    color: colors.onPrimary,
    textAlign: "center",
  },
  /** "Pular" é discreto de propósito: é uma saída legítima, não um atalho a ser incentivado. */
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  skipButtonText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});
