import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /** O número grande, que é o que a pessoa veio ver — e o que ela vai mostrar ao médico. */
  destaque: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  destaqueTaxa: {
    ...typography.headlineMd,
    fontSize: 48,
    lineHeight: 56,
  },
  destaqueLegenda: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * As três faixas de cor. Só a cor muda — nunca o tamanho, nem o ícone, nem uma mensagem de
   * incentivo. A cor orienta a leitura; o julgamento fica com o médico.
   */
  taxa_boa: {
    color: colors.success,
  },
  taxa_media: {
    color: colors.onWarningSurface,
  },
  taxa_baixa: {
    color: colors.error,
  },

  contagens: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  contagem: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: 2,
  },
  contagemValor: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  contagemRotulo: {
    ...typography.label,
    color: colors.onSurface,
  },
  /** A explicação em letra menor: o rótulo sozinho não distingue "pulada" de "sem resposta". */
  contagemDica: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  secao: {
    gap: spacing.sm,
  },
  secaoTitulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  linhaDetalhe: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  linhaTaxa: {
    ...typography.headlineSm,
    fontSize: 18,
  },

  perdida: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  perdidaNome: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  /**
   * Cinza, e não vermelho. A lista inteira já é de doses não tomadas — pintar cada linha de erro
   * transformaria um registro clínico numa fileira de repreensões, e quem lê isso sobre a própria
   * semana tende a parar de registrar em vez de parar de esquecer.
   */
  perdidaSelo: {
    ...typography.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },

  rodape: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: "center",
  },
});
