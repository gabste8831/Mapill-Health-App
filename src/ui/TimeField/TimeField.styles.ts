import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
  /**
   * `marginTop` alinha o botão com o input, e não com o rótulo acima dele: sem isso ele sobe e fica
   * na altura do texto "HORÁRIO", longe do campo que abre. Mesma medida do `DateField`, para os
   * dois campos ficarem alinhados quando aparecem um sob o outro.
   */
  botaoDeRelogio: {
    marginTop: 22,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  /** Sem o rótulo acima não há o que compensar: o botão alinha direto com o topo do campo. */
  botaoDeRelogioSemRotulo: {
    marginTop: 0,
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
});
