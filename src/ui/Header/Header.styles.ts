import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

const ICON_SLOT_SIZE = 44;

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.onPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  /**
   * Largura fixa nos dois lados, mesmo vazio: é o que mantém o título opticamente centrado
   * independente de haver ou não botão. Sem isso o título desloca conforme os ícones.
   */
  iconSlot: {
    width: ICON_SLOT_SIZE,
    height: ICON_SLOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  brandSlot: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  /**
   * A imagem é o lockup inteiro (ícone + wordmark), proporção ~3.2:1. Largura fixa em vez de
   * `flex` porque `contentFit: contain` centraria a marca na sobra de espaço.
   */
  brand: {
    width: 90,
    height: 28,
  },
});
