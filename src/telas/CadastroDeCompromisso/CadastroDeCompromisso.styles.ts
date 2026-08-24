import { StyleSheet } from "react-native";

import { colors, marginMobile, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: marginMobile,
    gap: spacing.md,
    // Espaço pro rodapé fixo não cobrir o último campo quando a tela chega ao fim.
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  selo: {
    ...typography.label,
    fontSize: 10,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    color: colors.onErrorContainer,
    backgroundColor: colors.errorContainer,
  },
  seloOpcional: {
    color: colors.onSecondaryContainer,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.6),
  },
  /** Data e hora lado a lado: são a mesma resposta partida em dois campos. */
  linhaDeQuando: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  campoDeQuando: {
    flex: 1,
  },
  hint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /** A confirmação em texto do que foi escolhido — "quarta-feira, 27 de agosto, às 14:30". */
  confirmacao: {
    ...typography.bodyMd,
    color: colors.onSecondaryContainer,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },
  /** Cor de atenção, não de erro: escolher uma antecedência menor resolve, e nada foi perdido. */
  aviso: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
    backgroundColor: colors.tertiaryContainer,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  erro: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.error,
  },
  /**
   * O último lugar da fileira de antecedências: as opções cobrem o comum e este campo cobre o
   * resto, sem gastar um segundo toque nem uma segunda linha. Mesmo padrão do "quantas vezes por
   * dia" do cadastro de medicamento.
   */
  campoLivre: {
    flexGrow: 1,
    minWidth: 72,
    height: 44,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  campoLivreAtivo: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.4),
  },
  footer: {
    padding: marginMobile,
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  submitHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});
