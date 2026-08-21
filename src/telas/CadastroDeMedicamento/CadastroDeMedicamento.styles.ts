import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    // Só respiro: o botão saiu do fim da rolagem e virou rodapé fixo, então não há mais o que
    // reservar aqui embaixo.
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurface,
  },
  sectionHint: {
    ...typography.bodyMd,
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
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  // Canto quadrado, diferente do avatar redondo da ficha: aqui é a caixa do remédio, não retrato.
  photoFrame: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  photoAddLabel: {
    ...typography.label,
    color: colors.primary,
  },
  photoHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /** Quantidade e unidade lado a lado: são uma informação só, lida em conjunto ("1 comprimido"). */
  doseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  doseAmountField: {
    flex: 1,
  },
  doseUnitField: {
    flex: 1.4,
  },
  /** Linha "valor atual + ação" — o resumo de uma escolha que se resolve em outro lugar. */
  rowValue: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rowValueText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  rowValueAction: {
    ...typography.label,
    color: colors.primary,
  },

  /** Resumo do que já foi definido no popup — fichinhas, no mesmo cinza dos botões de escolha. */
  timeChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
  },
  timeChipVazio: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    backgroundColor: "transparent",
  },
  timeChipErro: {
    backgroundColor: colors.errorContainer,
  },
  timeChipText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  /**
   * O último lugar da fileira de "quantas vezes por dia": as opções cobrem o comum e este campo
   * cobre o resto, sem gastar um segundo toque nem uma segunda linha.
   */
  dosesInput: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: "center",
  },
  dosesInputAtivo: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },

  /** Os sete dias numa linha só, ocupando a largura toda — a semana se lê de uma vez ou não se lê. */
  weekdayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  weekday: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
  },
  weekdaySelected: {
    backgroundColor: colors.primary,
  },
  weekdayText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  weekdayTextSelected: {
    color: colors.onPrimary,
  },

  submitHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  fieldErrorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  /**
   * Duas informações que o paciente deu e que não fecham entre si (estoque menor que o
   * tratamento). Cor de atenção e não de erro: nada aqui está inválido, só vale olhar.
   */
  avisoDeConflito: {
    ...typography.bodyMd,
    color: colors.tertiary,
    backgroundColor: withOpacity(colors.tertiary, 0.08),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /** Explicação que não é campo nem erro — texto de apoio que merece peso, tipo regra do sistema. */
  sectionHintDestaque: {
    ...typography.bodyMd,
    color: colors.onSecondaryContainer,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  avisoDePermissao: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.tertiary, 0.08),
  },
  avisoDePermissaoTitulo: {
    ...typography.label,
    color: colors.tertiary,
  },
  avisoDePermissaoTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * Resumo de uma configuração feita em popup. Rótulo e valor em colunas, porque "50 comprimidos
   * · em cima da geladeira" numa linha só obriga a decifrar o que é o quê pelo conteúdo.
   */
  resumoBloco: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  resumoRotulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    width: 96,
  },
  resumoValor: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  sheetBody: {
    gap: spacing.md,
  },

  /**
   * A virada de "só o essencial" para "o resto também". Acontece uma vez só, e é anunciada: se
   * cada seção nascesse conforme o paciente digita, a tela pularia debaixo do dedo e ninguém
   * perceberia que algo apareceu.
   */
  revelacao: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  revelacaoTitulo: {
    ...typography.bodyLg,
    color: colors.primary,
    textAlign: "center",
  },
  revelacaoHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  /** Saída de uma configuração já ligada — discreta, porque desligar é exceção e não atalho. */
  textoDeSaida: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },

  /**
   * Rodapé fixo: o botão precisa estar à vista o tempo todo pra dizer, sem texto, que dá pra
   * parar de preencher a qualquer momento.
   */
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
});
