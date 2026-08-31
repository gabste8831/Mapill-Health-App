import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Fundo levemente diferente do cartão, e não branco sobre branco: a lista precisa ler como um
   * bloco à parte do formulário — é conteúdo que apareceu, não campo que sempre esteve ali.
   */
  container: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  titulo: {
    ...typography.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    // Alvo confortável: a lista aparece sob o dedo de quem está digitando, e um item raso é toque
    // errado — que aqui significa cadastrar o remédio errado.
    minHeight: 52,
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  /** A dosagem no mesmo peso do nome: "Tylenol 500" e "Tylenol 750" só diferem por ela. */
  dosagem: {
    color: colors.primary,
  },
  substancia: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
