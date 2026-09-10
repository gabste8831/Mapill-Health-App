import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  raiz: {
    gap: spacing.md,
  },
  legenda: {
    gap: spacing.sm,
  },
  legendaTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  legendaLinha: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendaPonto: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
  },
  legendaTexto: {
    ...typography.bodySm,
    color: cores.onSurface,
    flexShrink: 1,
  },
  /**
   * Colunas de largura igual que quebram para a linha seguinte.
   *
   * **Duas por linha**, com os quatro conjuntos alternativos formando um quadrado.
   *
   * Já foram três por linha, quando o conjunto original também estava na grade: cinco opções em
   * colunas de um terço deixavam uma órfã embaixo. Com o original virando botão, sobram quatro —
   * e quatro em 2x2 dá o dobro de largura a cada amostra, que é o que se veio comparar.
   */
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  /**
   * A opcao mora dentro do cartao da tela, entao ela e uma superficie **aninhada**: fundo um
   * degrau acima do branco, sem sombra nem contorno proprios. Com `superficieDeCartao` aqui eram
   * dois cartoes um dentro do outro, e a borda interna competia com a externa.
   */
  opcao: {
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: radius.md,
    width: "48.5%",
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primarySurface,
  },
  amostra: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  quadrado: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  nome: {
    ...typography.bodyMd,
    color: cores.onSurface,
    textAlign: "center",
  },
  nomeSelecionado: {
    ...typography.bodyMd,
    color: cores.onPrimarySurface,
    textAlign: "center",
  },
  marcaVazia: {
    height: 18,
  },
  botaoDeRestaurar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
  },
  textoDeRestaurar: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
}));
