import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
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
