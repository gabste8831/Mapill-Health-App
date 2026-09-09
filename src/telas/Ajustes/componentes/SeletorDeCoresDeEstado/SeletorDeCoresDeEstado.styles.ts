import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  raiz: {
    gap: spacing.md,
  },
  /**
   * A legenda, numa linha só.
   *
   * Ela mostra as cores **do par escolhido**, e não as do padrão: assim que a pessoa toca numa
   * opção, a legenda muda junto e confirma a escolha com o nome de cada estado ao lado. É a mesma
   * informação da amostra, dita em palavras para quem ainda não tem certeza do que está vendo.
   */
  legenda: {
    gap: spacing.sm,
  },
  legendaTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  /**
   * Os tres estados lado a lado, distribuidos na largura.
   *
   * Itens do tamanho do conteudo, alinhados a **esquerda** e separados por um vao fixo.
   *
   * Ja foram tres colunas de `flex: 1`, e o vao sobrava depois do texto mais curto — "Atencao"
   * ficava com um buraco a direita que "Confirmacao" nao tinha. Depois foi `space-between`, que
   * resolveu aquilo e criou outro: o ultimo item encostava na borda do bloco, fora do ritmo dos
   * paragrafos acima, que respeitam o padding do cartao. Alinhados a esquerda, os tres comecam
   * onde o texto comeca e terminam onde precisam terminar.
   */
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
  /**
   * Quadrado de canto suave, e nao circulo.
   *
   * E a mesma forma das faixas da amostra logo abaixo — a legenda diz o que aquelas faixas
   * significam, e repetir a forma e o que liga as duas coisas sem precisar de seta ou explicacao.
   */
  legendaPonto: {
    width: 16,
    height: 16,
    borderRadius: radius.sm,
  },
  legendaTexto: {
    ...typography.bodySm,
    color: cores.onSurface,
    // Cede a largura antes do ponto: um rotulo cortado ainda se adivinha, um ponto espremido nao
    // mostra a cor, que e o que a legenda existe para fazer.
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
    /**
     * Metade da largura menos metade do vao, travado: `flexBasis` sozinho e um **piso**, e com
     * `flexGrow` uma tela larga acomodaria tres colunas — a grade deixava de ser 2x2 e o rotulo
     * espremia. Aqui a largura e a conta, e ela vale em qualquer tela.
     */
    width: "48.5%",
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primarySurface,
  },
  /**
   * As três cores como quadrados lado a lado, na mesma ordem da legenda.
   *
   * Era uma barra única dividida em três faixas horizontais. O bloco retangular lia como um
   * elemento só — uma amostra de gradiente — em vez de três cores que se comparam; e as faixas
   * encostadas sem respiro faziam a do meio parecer transição entre as outras duas.
   *
   * Separados, cada quadrado é uma cor, e a forma é a mesma do quadradinho da legenda: quem leu
   * "Confirmação" ali reconhece o primeiro daqui sem precisar de rótulo.
   */
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
  /** Reserva a altura do selo na opção não escolhida, para as colunas ficarem do mesmo tamanho. */
  marcaVazia: {
    height: 18,
  },
  /**
   * O botão que desfaz a escolha.
   *
   * Sem preenchimento e sem contorno: ele não é a ação que a seção oferece — é a saída dela. Um
   * botão cheio aqui competiria com as quatro opções acima, que é onde a decisão acontece.
   */
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
