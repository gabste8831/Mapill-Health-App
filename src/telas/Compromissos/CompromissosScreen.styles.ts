import {
  bottomTabInset,
  estilosDoTema,
  listGap,
  radius,
  screenPadding,
  spacing,
  superficieDeCartao,
  typography,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  listHeader: {},
  busca: {
    marginTop: spacing.md,
  },
  /**
   * O mesmo respiro da contagem em Remédios: `md` acima, `sm` abaixo.
   *
   * As duas telas são a mesma lista em abas diferentes, e a contagem tinha aqui só o espaço que
   * sobrava do `listHeader` — colada na busca em cima e no primeiro card embaixo.
   */
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    // `lg`, como em Remédios: são a mesma lista em abas diferentes.
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  semResultado: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingVertical: spacing.lg,
    textAlign: "center",
  },
  blocoAnteriores: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  blocoAnterioresSozinho: {
    marginTop: 0,
  },
  divisorDeEscopo: {
    height: 1,
    backgroundColor: cores.outlineVariant,
  },
  acordeaoAnteriores: {
    backgroundColor: cores.surfaceContainerLowest,
    ...(ajustes?.contornarSuperficies
      ? { borderWidth: 1, borderColor: cores.outlineVariant }
      : null),
  },

  // --- Item da lista ---
  /** Mesmo aperto de Remédios (`md` no lugar do `gutter` do token): é a mesma lista, em outra aba. */
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
  dataColuna: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    // Azul principal com o número em branco — a mesma cor de ação do resto do app, e não mais o
    // container secundário: é o que dá à data o mesmo peso que a foto tem na lista de remédios.
    backgroundColor: cores.corDeDestaque,
  },
  diaDoMes: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  mesAbreviado: {
    ...typography.caption,
    color: cores.onPrimary,
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  itemPassado: {
    opacity: 0.6,
  },
  horaEProfissional: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
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

  // --- Estados ---
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
