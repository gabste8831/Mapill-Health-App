import { StyleSheet } from "react-native";

import { bottomTabInset, colors, radius, spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.md,
    // Sobe a altura da barra de abas: sem isso ele fica atrás dela e metade do alvo some.
    bottom: bottomTabInset + spacing.md,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  icon: {
    color: colors.onPrimary,
    fontSize: 28,
    lineHeight: 28,
  },
});
