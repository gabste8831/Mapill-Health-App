import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Amarelo com barra viva à esquerda — o mesmo tratamento da `Dica` e do aviso de permissão no
   * cadastro. Repetir a linguagem importa: quem já viu o bloco amarelo lá reconhece este aqui como
   * o mesmo assunto, sem precisar reler.
   */
  container: {
    backgroundColor: colors.warningSurface,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.onWarningSurface,
  },
  texto: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  /**
   * Contorno em vez de preenchido: o card já chama atenção pelo fundo, e um botão sólido em cima
   * dele competiria com o alerta de estoque, que é vermelho cheio e representa algo pior.
   */
  botao: {
    borderWidth: 1,
    borderColor: colors.onWarningSurface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  botaoTexto: {
    ...typography.label,
    color: colors.onWarningSurface,
  },
});
