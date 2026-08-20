import { StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Sombra em vez de borda: o fundo da tela e o card são quase da mesma cor, então a borda de
   * 1px fazia o card parecer uma caixa desenhada e não uma superfície acima. A sombra é
   * discreta de propósito — o objetivo é separar do fundo, não empilhar camadas.
   */
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.gutter,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
  },
});
