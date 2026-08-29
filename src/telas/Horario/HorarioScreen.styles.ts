import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  /** "Sábado, 29 de agosto às 08:00" — situa quem chegou pela notificação horas depois. */
  quando: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  resumo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },

  // --- Cartão de dose ---
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Respondida fica esmaecida, mas continua legível: é registro, não lixo. */
  cardResolvido: {
    opacity: 0.72,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTexto: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.headlineSm,
    fontSize: 18,
    color: colors.onSurface,
  },
  quantidade: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  orientacao: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  selo: {
    alignItems: "center",
    gap: 2,
  },
  seloTexto: {
    ...typography.label,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  corrigirDica: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * Os dois botões lado a lado e do mesmo tamanho. "Tomei" e "Pulei" são respostas igualmente
   * legítimas — dar mais peso a uma delas é sugerir a resposta, e o registro só vale se for o que
   * de fato aconteceu.
   */
  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },

  /** Afastado da lista: é saída da tela, não mais uma ação de dose. */
  irParaHome: {
    marginTop: spacing.md,
  },

  // --- Estados ---
  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: "center",
  },
});
