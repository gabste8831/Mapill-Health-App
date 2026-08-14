import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    // Alinha o topo do quadrado com a primeira linha do texto ao lado, mesmo quando o label
    // quebra em várias linhas (accessibility: alvo de toque de 24 é pequeno demais sozinho,
    // por isso a área de toque real é a row inteira, não só o box — ver Checkbox.tsx).
    marginTop: 2,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
});
