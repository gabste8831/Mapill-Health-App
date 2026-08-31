import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // --- Cartão de um estoque ---
  item: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    padding: spacing.md,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  itemHeaderText: {
    flex: 1,
  },
  name: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  local: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /** O número é a resposta da tela, então ele tem o peso de um título e não o de um detalhe. */
  quantidade: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "right",
  },
  quantidadeCritica: {
    color: colors.error,
  },
  previsao: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  previsaoCritica: {
    color: colors.error,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  acao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // Mesmo piso de alvo de toque usado no calendário: abaixo de 44 a linha vira armadilha.
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  acaoTexto: {
    ...typography.label,
    color: colors.onSurface,
  },
  acaoTextoPrimaria: {
    color: colors.primary,
  },

  // --- Rodapé: o caminho pra quem não achou um remédio aqui ---
  rodape: {
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  rodapeTitulo: {
    ...typography.label,
    color: colors.onSurface,
  },
  rodapeTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * O lembrete de conferência. Amarelo com barra lateral, a mesma linguagem da `Dica` — porque é
   * exatamente isso: apoio, não cobrança. O plano registra a recontagem como **não obrigatória**
   * (decisão nº6), e o app funciona igual se ninguém nunca conferir.
   */
  lembrete: {
    backgroundColor: colors.warningSurface,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  lembreteTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lembreteTitulo: {
    ...typography.label,
    color: colors.onWarningSurface,
  },
  lembreteTexto: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  // --- Popup de recontagem / reposição ---
  sheetBody: {
    gap: spacing.md,
  },
  sheetMedicamento: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  sheetAtual: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  sheetPrevia: {
    ...typography.bodyMd,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },

  // --- Estados ---
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
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
    textAlign: "center",
    maxWidth: 320,
  },
});
