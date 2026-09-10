
import { bottomTabInset, estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  gradeNoScroll: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.sm,
  },

  filtros: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cores.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  // --- Item da lista ---
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: cores.corDeDestaque,
  },
  itemBarraPassada: {
    borderLeftColor: cores.outlineVariant,
  },
  itemPassado: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  horaDoCompromisso: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  itemHeaderText: {
    flex: 1,
  },
  tipo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  detalhe: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  observacao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  rodapeDoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  aviso: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  perguntaDeDesfecho: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  perguntaTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  botoesDeDesfecho: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoDeDesfecho: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  botaoFui: {
    backgroundColor: cores.primary,
  },
  botaoFuiTexto: {
    ...typography.caption,
    color: cores.onPrimary,
  },
  botaoNaoFui: {
    backgroundColor: cores.surfaceContainer,
  },
  botaoNaoFuiTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  desfecho: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  desfechoTexto: {
    ...typography.label,
    flex: 1,
  },
  desfechoCompareceu: {
    color: cores.corDeDestaque,
  },
  desfechoFaltou: {
    color: cores.error,
  },
  anotacaoDoDesfecho: {
    ...typography.bodyMd,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  sheetBody: {
    gap: spacing.md,
  },

  dia: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  vazioDoDia: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  marco: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  marcoTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    flex: 1,
  },

  // --- Cabeçalho de dia ---
  diaHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  diaTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  diaHoje: {
    color: cores.corDeDestaque,
  },
  diaData: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  // --- Bloco de doses do dia ---
  blocoDeDoses: {
    ...superficieDeCartao(cores, ajustes),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linhaDeDose: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linhaComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  horaDaDose: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  textoDaDose: {
    flex: 1,
  },
  nomeDaDose: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  quantidadeDaDose: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  doseResolvida: {
    opacity: 0.55,
  },
  acoesDaDose: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  botaoDaDose: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainerLow,
  },

  // --- Estados ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
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
    textAlign: "center",
    maxWidth: 320,
  },
}));
