import { StyleSheet } from "react-native";

import {
  bottomTabInset,
  colors,
  listGap,
  radius,
  screenPadding,
  spacing,
  surfaceCard,
  typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  /**
   * `gutter` entre os blocos, e não `lg`: a Home empilha coisas de natureza diferente — saudação,
   * progresso do dia, agenda —, e é o espaço entre elas que diz que são assuntos separados.
   */
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.gutter,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  greetingRow: {
    gap: spacing.md,
  },
  greetingText: {
    gap: spacing.xs,
  },
  dateLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  greeting: {
    ...typography.headlineXl,
    color: colors.onSurface,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  progressLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  progressValue: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  /**
   * A trilha subiu de 4 para 8px e a ponta ficou redonda. Com 4 ela era um fio: some no meio da
   * tela e não se lê de relance, que é justamente o único jeito como um resumo do dia é lido.
   *
   * O trilho vazio também clareou — `outlineVariant` é a cor de contorno, e usada como área cheia
   * ficava escura demais, dando à barra vazia o peso de uma barra cheia.
   */
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  progressCaption: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  doseList: {
    gap: listGap,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  /** O rótulo da seção e a ação que vale para ela inteira, na mesma linha. */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * Ação de lote, em texto e não em botão cheio: ela vale para a seção toda, e um botão sólido
   * ali competiria com os de cada dose — que continuam sendo o caminho normal.
   */
  bulkAction: {
    ...typography.label,
    color: colors.primary,
    paddingVertical: spacing.xs,
  },
  emptyState: {
    ...surfaceCard,
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  /**
   * O erro da Home como faixa, e não como tela cheia: a saudação, o progresso e os cards continuam
   * valendo, e trocar tudo por um aviso apagaria o contexto de quem só queria ver o dia.
   */
  erroInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  erroAcao: {
    ...typography.label,
    color: colors.error,
  },
});
