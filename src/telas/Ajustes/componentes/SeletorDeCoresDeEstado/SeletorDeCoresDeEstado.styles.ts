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
  /**
   * As três cores como **uma faixa contínua**, e não três quadrados soltos.
   *
   * Eram 26dp fixos com um vão entre eles, o que sobrava espaço morto nas laterais e dava à amostra
   * menos área do que a opção tinha para oferecer. Aqui ela ocupa a largura inteira em três terços
   * encostados, do jeito de uma bandeira: mais pigmento na tela, e as cores se tocando — que é a
   * condição em que a diferença entre duas delas fica mais fácil de ver, sem o fundo se intrometendo
   * entre uma e outra.
   *
   * O contorno e o arredondamento passam a ser da faixa, não de cada cor: com as partes coladas,
   * uma borda por cor desenharia dois traços no mesmo encontro. `overflow: "hidden"` é o que faz os
   * cantos das pontas seguirem o raio da faixa.
   */
  amostra: {
    flexDirection: "row",
    alignSelf: "stretch",
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    overflow: "hidden",
  },
  /** Um terço cada: `flex: 1` divide igualmente sem depender de saber a largura da opção. */
  faixa: {
    flex: 1,
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
