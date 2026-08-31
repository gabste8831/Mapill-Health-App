import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Pílula, e não o retângulo dos campos de formulário: a forma arredondada é o que sinaliza
   * "busca" antes de qualquer rótulo — é a mesma do widget de busca que a pessoa já usa todo dia
   * na tela inicial do celular. Buscar também é diferente de preencher: nada aqui vai ser salvo,
   * e o campo não deve parecer que cobra uma resposta.
   */
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    // `minHeight`, e não `height`: com altura travada o texto da busca é recortado quando a fonte
    // do sistema está ampliada, e a borda continua aqui porque isto é campo — ela informa que se
    // pode escrever dentro.
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: surfaceShadow,
  },
  input: {
    flex: 1,
    // Sem altura própria: o container manda, e o texto fica centrado nele.
    padding: 0,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  /** Alvo de toque confortável sem esticar a pílula — o recuo compensa o padding do container. */
  clearButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
});
