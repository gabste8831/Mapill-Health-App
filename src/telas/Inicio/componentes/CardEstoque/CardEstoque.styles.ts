import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceCard, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    ...surfaceCard,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  icone: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  texto: {
    flex: 1,
  },
  titulo: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  descricao: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
