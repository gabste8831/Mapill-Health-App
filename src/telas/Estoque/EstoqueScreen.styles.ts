
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: spacing.xxl,
  },

  // --- Cartão de um estoque ---
  /** Mesmo cartão da lista de medicações: sombra, sem borda, respiro de `gutter`. */
  item: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  itemHeaderText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  local: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** O número é a resposta da tela, então ele tem o peso de um título e não o de um detalhe. */
  quantidade: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "right",
  },
  quantidadeCritica: {
    color: cores.error,
  },
  previsao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  previsaoCritica: {
    color: cores.error,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  acao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // Mesmo piso de alvo de toque usado no calendário: abaixo de 44 a linha vira armadilha.
    minHeight: 44,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  /**
   * "Repor" ganha superfície azul clara — antes ele era idêntico a "Recontar" e mudava só a cor do
   * texto, ou seja, um botão primário disfarçado de secundário.
   *
   * As duas ações não têm o mesmo peso: recontar é conferência ocasional, repor é o que a pessoa
   * veio fazer quando abriu esta tela porque o remédio está acabando. A cor diz qual é qual antes
   * de o rótulo ser lido.
   */
  acaoPrimaria: {
    backgroundColor: cores.secondaryContainer,
  },
  acaoTexto: {
    ...typography.label,
    color: cores.onSurface,
  },
  acaoTextoPrimaria: {
    color: cores.onSecondaryContainer,
  },

  // --- Rodapé: o caminho pra quem não achou um remédio aqui ---
  rodape: {
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: cores.surfaceContainerLow,
  },
  rodapeTitulo: {
    ...typography.label,
    color: cores.onSurface,
  },
  rodapeTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * O lembrete de conferência. Âmbar diluído, a mesma linguagem da `Dica` — porque é
   * exatamente isso: apoio, não cobrança. O plano registra a recontagem como **não obrigatória**
   * (decisão nº6), e o app funciona igual se ninguém nunca conferir.
   */
  lembrete: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  lembreteTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lembreteTitulo: {
    ...typography.label,
    color: cores.onWarningSurface,
  },
  lembreteTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },

  // --- Popup de recontagem / reposição ---
  sheetBody: {
    gap: spacing.md,
  },
  sheetMedicamento: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  sheetAtual: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  sheetPrevia: {
    ...typography.bodyMd,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },

  // --- Estados ---
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
