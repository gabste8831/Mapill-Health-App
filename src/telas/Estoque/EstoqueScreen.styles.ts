
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  listHeader: {
    gap: spacing.lg,
  },
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    gap: listGap,
    paddingBottom: spacing.xxl,
  },

  // --- Cartão de um estoque ---
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },
  identificacao: {
    gap: spacing.md,
  },
  name: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  quantidade: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  quantidadeCritica: {
    color: cores.error,
  },
  /**
   * O prazo, em três estados.
   *
   * Neutro é texto puro, sem fundo nem padding: a maioria dos remédios está longe de acabar, e
   * pintar todos eles gastaria o destaque justamente onde ele não serve para nada.
   */
  previsao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  previsaoTextoEmAlerta: {
    color: cores.onWarningVivo,
  },
  previsaoTextoCritico: {
    color: cores.onErrorSurface,
  },
  previsaoEtiqueta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    backgroundColor: cores.surfaceContainerLow,
  },
  previsaoEmAlerta: {
    backgroundColor: cores.warningVivo,
  },
  previsaoCritica: {
    backgroundColor: cores.errorSurface,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  acao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 36,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  /**
   * Azul cheio: "Repor" é a ação que se vem fazer aqui — voltou da farmácia e quer somar o que
   * chegou. "Recontar" é conferência, e fica ao lado como alternativa, não como igual.
   *
   * O azul saiu do dado (a quantidade tinha fundo azul) e veio para a ação: num cartão que é todo
   * informação, o que deve puxar o olho é o que se pode fazer com ela.
   */
  acaoPrimaria: {
    backgroundColor: cores.primaryContainer,
  },
  acaoTexto: {
    ...typography.label,
    color: cores.onSurface,
  },
  acaoTextoPrimaria: {
    color: cores.onPrimaryContainer,
  },

  linhaDeAviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.md,
  },
  linhaDeAvisoTexto: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
    flex: 1,
  },

  // --- Rodapé: o caminho pra quem não achou um remédio aqui ---
  rodape: {
    marginTop: spacing.md,
  },

  lembrete: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
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
  sheetConflito: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    backgroundColor: cores.warningSurface,
    padding: spacing.sm,
    borderRadius: radius.md,
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
