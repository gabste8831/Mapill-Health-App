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
  /**
   * Sombra em vez de borda, mesma lógica do Card — mas com um contorno tênue por baixo.
   *
   * Só a sombra bastava sobre o fundo da tela; dentro de um `BottomSheet`, que já é uma superfície
   * clara elevada, ela desaparecia e o botão sumia junto. "Cancelar" ficava um texto solto ao lado
   * do "Confirmar", que é justamente onde ninguém pode hesitar sobre o que é clicável.
   */
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
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
