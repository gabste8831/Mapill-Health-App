import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Fundo neutro, sem cor de estado. Nem verde de sucesso nem amarelo de atenção: ter alterações
   * por enviar é o funcionamento normal de um app offline-first, e pintar isso de aviso ensinaria
   * a pessoa a se preocupar com algo que não é problema.
   */
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  /** Largura fixa para o texto não dançar quando o ícone vira spinner. */
  icone: {
    width: 24,
    alignItems: "center",
  },
  texto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  detalhe: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
});
