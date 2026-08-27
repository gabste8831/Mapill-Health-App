import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    // Fundo tênue derivado do próprio token de destaque, em vez de uma cor nova solta na paleta:
    // a dica precisa se separar do texto ao redor sem competir com o erro, que é vermelho cheio.
    backgroundColor: withOpacity(colors.tertiary, 0.08),
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
