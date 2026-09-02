import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Amarelo com faixa lateral — a mesma linguagem da `Dica` e do aviso de estoque baixo.
   *
   * É apoio, não erro: falta um ajuste do sistema, e o app funciona. A faixa colorida à esquerda,
   * em vez de contorno inteiro, segue a decisão de 30/08 — contorno somado a fundo colorido dá a
   * qualquer bloco o peso de um alerta crítico, e aí nada mais consegue parecer urgente.
   */
  painel: {
    backgroundColor: colors.warningSurface,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma essencial: o alarme não toca, e aí é erro mesmo. */
  painelCritico: {
    backgroundColor: colors.errorSurface,
    borderLeftColor: colors.error,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titulo: {
    ...typography.label,
    color: colors.onSurface,
    flex: 1,
  },
  explicacao: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 22,
  },

  lista: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  /**
   * A linha inteira é o alvo, e não um botão no canto.
   *
   * Cada item leva a uma tela diferente do sistema, e um alvo grande é o que separa "resolvo agora"
   * de "depois eu vejo" — que, nesta lista, significa continuar sem alarme.
   */
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  itemTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemTitulo: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  itemDescricao: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },

  /** Separa o que impede o alarme do que só o degrada — as duas coisas pedem urgências diferentes. */
  selo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: colors.error,
  },

  botaoPedir: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  botaoPedirTexto: {
    ...typography.label,
    color: colors.onPrimary,
  },
});
