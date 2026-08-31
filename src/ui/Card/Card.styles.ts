import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceShadow } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Sombra em vez de borda: o fundo da tela e o card são quase da mesma cor, então a borda de
   * 1px fazia o card parecer uma caixa desenhada e não uma superfície acima. A sombra é
   * discreta de propósito — o objetivo é separar do fundo, não empilhar camadas.
   *
   * Esta foi a decisão original (21/08); o valor virou `surfaceShadow` em 30/08, quando ficou
   * claro que a cópia dele em cinco arquivos era o que deixava as telas divergirem.
   */
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.gutter,
    boxShadow: surfaceShadow,
  },
});
