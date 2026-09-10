
import { estilosDoTema, fieldLabelGap, radius, spacing, typography, withOpacity } from "@/shared/theme";

const TAMANHO_DA_FOTO = 72;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * `bodyLg` e não `headlineSmRegular`: um degrau abaixo na escala (16 em vez de 18).
   *
   * "ESTOQUE", "ANEXOS", "LEMBRETE" nomeiam a seção — não competem com o conteúdo dela. A 18 eles
   * pesavam como título de tela num formulário que já tem muitos, e o mesmo token servia aos
   * títulos de Ajustes, onde o efeito era o mesmo.
   */
  sectionTitle: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  linkParaTermos: {
    ...typography.bodyMd,
    color: cores.corDeDestaque,
    textDecorationLine: "underline",
  },
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * O quadro da mídia, **igual com e sem imagem** — ver a mesma decisão na ficha de saúde.
   *
   * Eram dois estilos trocados no lugar, e a troca recriava o contêiner no instante em que a
   * `Image` montava: no Android o `overflow: "hidden"` chegava depois do primeiro paint, e a foto
   * era pintada fora da área visível do pai. Daí a **primeira** foto ficar branca enquanto trocar
   * uma existente funcionava — trocar não muda de estilo, estrear muda.
   */
  photoQuadro: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  photoVazio: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderStyle: "dashed",
  },
  photo: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
  },
  /**
   * As duas maneiras de anexar a receita, lado a lado — são alternativas, não sequência.
   *
   * `flexWrap` porque em tela estreita os dois rótulos não cabem na largura que sobra ao lado da
   * miniatura de 72px: sem ele, o segundo era espremido até quebrar no meio da palavra.
   */
  acoesDeAnexo: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  photoTextGroup: {
    flex: 1,
  },
  photoAddLabel: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  photoExcluirLabel: {
    ...typography.label,
    color: cores.error,
  },
  photoHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  linhaDeDose: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campoDeHorario: {
    flex: 1,
  },
  campoDeQuantidade: {
    flex: 1,
  },
  campoDeCiclo: {
    flex: 1,
  },

  rowValue: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rowValueAtivo: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
  },
  rowValueText: {
    ...typography.bodyLg,
    color: cores.onSurface,
    flex: 1,
  },
  rowValueAction: {
    ...typography.label,
    color: cores.corDeDestaque,
  },

  timeChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
  },
  timeChipVazio: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: cores.outlineVariant,
    backgroundColor: "transparent",
  },
  timeChipErro: {
    backgroundColor: cores.errorContainer,
  },
  timeChipText: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },

  botaoDeHorario: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
  },
  botaoDeHorarioErro: {
    borderColor: cores.error,
  },
  botaoDeHorarioTexto: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  botaoDeHorarioVazio: {
    color: cores.outline,
  },

  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acaoDaLinha: {
    flex: 1,
  },

  dosesInput: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    ...typography.bodyMd,
    color: cores.onSurface,
    textAlign: "center",
  },
  dosesInputAtivo: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },

  weekdayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  weekday: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
  },
  weekdaySelected: {
    backgroundColor: cores.primary,
  },
  weekdayText: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  weekdayTextSelected: {
    color: cores.onPrimary,
  },

  submitHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  fieldErrorText: {
    ...typography.bodyMd,
    color: cores.error,
  },
  avisoDeConflito: {
    ...typography.bodyMd,
    color: cores.error,
    backgroundColor: withOpacity(cores.error, 0.08),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  avisoDePrazo: {
    gap: spacing.sm,
  },

  sectionHintDestaque: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },
  previsaoDoLembrete: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    marginTop: -spacing.md,
  },
  previsaoDoLembreteVazia: {
    ...typography.bodyMd,
    color: cores.error,
    marginTop: -spacing.md,
  },

  blocoDeAjuda: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
  },
  assuntoDeAjuda: {
    gap: spacing.xs,
  },
  assuntoDeAjudaTitulo: {
    ...typography.bodyLg,
    color: cores.onSecondaryContainer,
  },
  assuntoDeAjudaTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  avisoDePermissao: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
  },
  avisoDePermissaoTitulo: {
    ...typography.bodyLg,
    color: cores.onSecondaryContainer,
  },
  avisoDePermissaoTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  resumoBloco: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  resumoRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 96,
  },
  resumoValor: {
    ...typography.bodyLg,
    color: cores.onSurface,
    flex: 1,
  },
  sheetBody: {
    gap: spacing.md,
  },

  revelacao: {
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: cores.outlineVariant,
    alignItems: "center",
  },
  revelacaoTitulo: {
    ...typography.bodyLg,
    color: cores.corDeDestaque,
    textAlign: "center",
  },
  revelacaoHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  textoDeSaida: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  alvoDeLink: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  alvoDeLinkRente: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    borderRadius: radius.md,
  },

}));
