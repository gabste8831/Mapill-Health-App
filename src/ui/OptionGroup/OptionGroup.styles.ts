import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
  option: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
  },
  /**
   * Cresce pra dividir a linha igualmente. A base é estreita de propósito: é ela que decide
   * quantas opções cabem antes de quebrar, e cinco botões curtos ("1×", "Mais") têm que caber
   * numa linha só de celular.
   */
  optionInline: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  /**
   * Duas colunas fixas, sem crescer. Deixar crescer é o que produz a última linha desalinhada —
   * três em cima e uma esticada na largura toda embaixo, que lê como defeito e não como grade.
   */
  optionGrid: {
    flexBasis: "48%",
    flexGrow: 0,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  optionStacked: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  optionLabelSelected: {
    color: colors.onPrimary,
  },
  optionHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  // Não é o branco cheio do label: continua sendo texto de apoio depois de selecionado, e
  // igualar os dois apagaria a hierarquia que o hint tem quando o cartão está apagado.
  optionHintSelected: {
    color: colors.secondaryContainer,
  },
});
