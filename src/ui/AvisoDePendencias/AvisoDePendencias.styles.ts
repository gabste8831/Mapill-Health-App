import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Discreto de propósito: fundo neutro, ícone pequeno, texto de apoio. Ele informa, não alerta —
   * e um aviso que compete com o conteúdo da lista seria lido uma vez e ignorado nas seguintes.
   */
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  texto: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
});
