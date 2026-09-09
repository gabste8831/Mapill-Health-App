import { estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    // `gutter` entre as seções: elas são assuntos diferentes (o visual e a percepção de cor), e
    // com o respiro de lista liam como um bloco só.
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },
  /**
   * O bloco azul claro de abertura, na mesma linguagem do hero de Conta e do banner da ficha.
   *
   * Azul e não âmbar: isto não é alerta, é orientação — a cor de aviso aqui faria a tela parecer
   * cobrar uma decisão, quando ela só explica o que há para escolher.
   */
  aviso: {
    backgroundColor: cores.primarySurface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  avisoTexto: {
    ...typography.bodyMd,
    color: cores.onPrimarySurface,
    lineHeight: 21,
  },
  /** Rótulo, texto e cartão de uma seção andam juntos, mais perto entre si que das outras. */
  secao: {
    gap: spacing.sm,
  },
  rotuloDaSecao: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  /** O cartão que embrulha a explicação e as opções, na mesma superfície do seletor de temas. */
  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.md,
  },
  /**
   * Cada frase num bloco próprio, e não um parágrafo corrido.
   *
   * São três coisas diferentes: o que as cores fazem, o que fazer se você não as distingue, e por
   * que o azul não está na lista. Emendadas, a terceira parecia ressalva da segunda.
   */
  paragrafo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    lineHeight: 21,
  },
  /**
   * O nome de cada cor dentro do parágrafo.
   *
   * `Text` aninhado, e não `<b>`: aquilo é HTML e o React Native não o conhece — ele tenta resolver
   * "b" como componente e derruba a tela. O que existe aqui é herança de estilo em `Text` dentro de
   * `Text`, e o peso vem da família da fonte, porque `fontWeight` não escolhe o arquivo certo numa
   * fonte carregada por peso.
   */
  paragrafoForte: {
    fontFamily: typography.label.fontFamily,
    color: cores.onSurface,
  },
}));
