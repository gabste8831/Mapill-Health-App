import { StyleSheet } from "react-native";

import { colors, listGap, screenPadding, spacing, surfaceCard, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },

  /** O número grande, que é o que a pessoa veio ver — e o que ela vai mostrar ao médico. */
  destaque: {
    ...surfaceCard,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  /** 48 e nao um token: numero de exibicao, unico no app. Criar token para um uso so infla a escala. */
  destaqueTaxa: {
    ...typography.headlineMd,
    fontSize: 48,
    lineHeight: 56,
  },
  destaqueLegenda: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * As três faixas de cor. Só a cor muda — nunca o tamanho, nem o ícone, nem uma mensagem de
   * incentivo. A cor orienta a leitura; o julgamento fica com o médico.
   */
  taxa_boa: {
    color: colors.success,
  },
  taxa_media: {
    color: colors.onWarningSurface,
  },
  taxa_baixa: {
    color: colors.error,
  },

  contagens: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  /**
   * Os três cartõezinhos lado a lado mantêm `padding: md`, e não o `gutter` do `surfaceCard`: em
   * três colunas numa tela de celular, 24 de respiro interno não sobra largura para o número.
   */
  contagem: {
    ...surfaceCard,
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  contagemValor: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  contagemRotulo: {
    ...typography.label,
    color: colors.onSurface,
  },
  /** A explicação em letra menor: o rótulo sozinho não distingue "pulada" de "sem resposta". */
  contagemDica: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },

  linha: {
    ...surfaceCard,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  linhaDetalhe: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  linhaTaxa: {
    ...typography.headlineSm,
  },

  /**
   * Aqui a linha divisória fica: são registros curtos e repetidos, não cartões — vinte deles em
   * cartão separado viram uma escada. O traço só clareou, porque `outlineVariant` num divisor
   * interno pesa como moldura de tabela.
   */
  perdida: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  perdidaNome: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  /**
   * Cinza, e não vermelho. A lista inteira já é de doses não tomadas — pintar cada linha de erro
   * transformaria um registro clínico numa fileira de repreensões, e quem lê isso sobre a própria
   * semana tende a parar de registrar em vez de parar de esquecer.
   */
  perdidaSelo: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
  },

  rodape: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },

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

  /**
   * A linha que abre o seletor de medicamentos — mesma anatomia do resumo de estoque no cadastro:
   * rótulo em cima, o que está escolhido embaixo, e o toque abre o popup. O estado atual fica
   * legível sem abrir nada, que é o que evita gerar um relatório recortado sem perceber.
   */
  filtro: {
    ...surfaceCard,
    padding: spacing.md,
    gap: spacing.xs,
  },
  filtroRotulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  filtroValor: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },

  /** O conteúdo do popup de seleção. */
  folha: {
    gap: listGap,
  },
  folhaAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  folhaAcao: {
    flex: 1,
  },
  folhaItem: {
    paddingVertical: spacing.xs,
  },
});
