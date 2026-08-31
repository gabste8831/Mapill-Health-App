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
  /**
   * Embrulha na largura que tiver. Diferente do `OptionGroup`, aqui a chip tem o tamanho do seu
   * texto e não o da coluna: a lista é de tamanhos irregulares ("Em jejum", "Com bastante água")
   * e esticar todas pro mesmo tamanho gastaria altura sem ganhar leitura.
   */
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  /**
   * `minHeight` de 44, e não `height` de 36. Eram dois problemas na mesma linha: 36 fica abaixo do
   * piso de alvo de toque, e **altura fixa com texto dentro corta a letra** quando a pessoa aumenta
   * a fonte do sistema — que é justamente o ajuste que o público deste app mais usa. Com `minHeight`
   * e padding vertical, a chip cresce junto com o texto em vez de recortá-lo.
   */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
});
