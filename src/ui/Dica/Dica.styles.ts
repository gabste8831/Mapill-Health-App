import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    // Amarelo diluído no fundo e cheio na barra da esquerda. O marrom anterior separava do texto
    // mas lia como rodapé; o amarelo diz "atenção" de longe. A cor viva fica só na barra porque
    // ela chama sem cobrir o texto — e uma dica não pode aparecer mais que um erro.
    backgroundColor: colors.warningSurface,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  /** Alinha o ícone com a primeira linha do texto, e não com o centro do bloco inteiro. */
  icone: {
    marginTop: 1,
  },
  texto: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
});
