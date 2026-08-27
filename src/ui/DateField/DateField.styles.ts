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
   * `marginTop` alinha o botão com o input, e não com o rótulo acima dele: sem isso ele sobe e
   * fica na altura do texto "DATA DE NASCIMENTO", longe do campo que abre.
   */
  botaoDeCalendario: {
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
