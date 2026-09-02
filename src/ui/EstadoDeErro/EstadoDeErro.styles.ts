import { StyleSheet } from "react-native";

import { colors, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  titulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  /** A mensagem técnica, em cinza: informa quem for investigar, sem gritar com quem só quer usar. */
  mensagem: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  /**
   * A frase que evita a conclusão errada. Num app de saúde, "não consegui carregar" pode ser lido
   * como "seus dados sumiram" — e essa leitura é pior que o erro em si.
   */
  tranquilizador: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  acao: {
    marginTop: spacing.md,
    minWidth: 200,
  },
});
