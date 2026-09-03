
import { bottomTabInset, estilosDoTema, gapEntreSecoes, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /**
   * `gutter` entre os blocos, e não `lg`: a Home empilha coisas de natureza diferente — saudação,
   * progresso do dia, agenda —, e é o espaço entre elas que diz que são assuntos separados.
   */
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    // `gapEntreSecoes` (40) e não `gutter` (24): a Home empilha assuntos independentes, e com todos
    // à mesma distância eles liam como uma pilha só — cada bloco disputando atenção com o vizinho.
    gap: gapEntreSecoes,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  greetingRow: {
    gap: spacing.md,
  },
  greetingText: {
    gap: spacing.xs,
  },
  dateLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  greeting: {
    ...typography.headlineXl,
    color: cores.onSurface,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  progressLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  progressValue: {
    ...typography.headlineSm,
    color: cores.corDeDestaque,
  },
  /**
   * A trilha subiu de 4 para 8px e a ponta ficou redonda. Com 4 ela era um fio: some no meio da
   * tela e não se lê de relance, que é justamente o único jeito como um resumo do dia é lido.
   *
   * O trilho vazio também clareou — `outlineVariant` é a cor de contorno, e usada como área cheia
   * ficava escura demais, dando à barra vazia o peso de uma barra cheia.
   */
  progressTrack: {
    height: 8,
    backgroundColor: cores.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: cores.primary,
  },
  progressCaption: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  doseList: {
    gap: listGap,
  },
  sectionLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  /** O rótulo da seção e a ação que vale para ela inteira, na mesma linha. */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * Ação de lote, em texto e não em botão cheio: ela vale para a seção toda, e um botão sólido
   * ali competiria com os de cada dose — que continuam sendo o caminho normal.
   */
  bulkAction: {
    ...typography.label,
    color: cores.corDeDestaque,
    paddingVertical: spacing.xs,
  },
  emptyState: {
    ...superficieDeCartao(cores, ajustes),
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
  },
  /**
   * O erro da Home como faixa, e não como tela cheia: a saudação, o progresso e os cards continuam
   * valendo, e trocar tudo por um aviso apagaria o contexto de quem só queria ver o dia.
   */
  erroInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: cores.error,
    backgroundColor: cores.errorSurface,
  },
  erroAcao: {
    ...typography.label,
    color: cores.error,
  },
}));
