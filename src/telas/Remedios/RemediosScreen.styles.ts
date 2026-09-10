
import { bottomTabInset, estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

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
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  listHeader: {
    gap: spacing.lg,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    gap: listGap,
    paddingBottom: bottomTabInset + spacing.xxl,
  },

  // --- Item da lista ---
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainer,
  },
  photoVazia: {
    backgroundColor: cores.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  itemHeaderText: {
    flex: 1,
    gap: 2,
  },
  acoes: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing.sm,
  },
  acaoBotao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 40,
  },
  acaoDivisor: {
    width: 1,
    backgroundColor: cores.outlineVariant,
    opacity: 0.5,
  },
  acaoTexto: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  acaoTextoDestrutivo: {
    color: cores.error,
  },

  // --- Popup de detalhe ---
  detalheBloco: {
    gap: spacing.md,
  },
  detalheLinha: {
    gap: 2,
  },
  detalheRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  detalheValor: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  name: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  activeIngredient: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  posology: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  stock: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  stockLow: {
    color: cores.error,
  },

  // --- Estados ---
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
