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
  requiredMark: {
    color: colors.error,
  },
  /** Mesma altura e borda de um TextField: é onde a resposta aparece, e trocar a caixa por um
   *  botão de aparência diferente faria parecer que o horário mora em outro lugar. */
  botao: {
    height: 52,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  botaoErro: {
    borderColor: colors.error,
  },
  texto: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  /** "--:--" é lacuna, não valor: fica no cinza de placeholder pra não ser lido como resposta. */
  textoVazio: {
    color: colors.outline,
  },
  sheetBody: {
    gap: spacing.md,
  },
  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },
  erro: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.error,
  },
});
