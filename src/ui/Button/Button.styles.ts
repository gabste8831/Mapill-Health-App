import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  /** Sombra em vez de borda, mesma lógica do Card: lê como superfície, não como contorno. */
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
  },
  /**
   * O mesmo botão, mas dentro de um `BottomSheet` — onde a sombra desaparece.
   *
   * A folha já é uma superfície clara elevada, então uma sombra sutil sobre ela não se vê, e o
   * botão sumia junto: "Cancelar" virava um texto solto ao lado do "Confirmar", justamente onde
   * ninguém pode hesitar sobre o que é clicável. O contorno entra **só aqui**, e não no `outline`
   * inteiro, porque sobre o fundo da tela a sombra funciona e a borda contraria a linguagem
   * visual do app (sombra no lugar de borda, decisão de 21/08).
   */
  outlineEmFolha: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  text: {
    backgroundColor: "transparent",
    height: "auto",
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.headlineSm,
    fontSize: 16,
  },
  primaryLabel: {
    color: colors.onPrimary,
  },
  outlineLabel: {
    color: colors.onSurface,
  },
  textLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
});
