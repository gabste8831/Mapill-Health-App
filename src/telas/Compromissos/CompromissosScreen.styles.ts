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
  /**
   * Respiro simétrico em cima e embaixo — o mesmo `md` que separa os cards entre si na lista, e
   * não o `gutter` (24) que ficava grande demais só embaixo, sem nada em cima pra equilibrar.
   */
  /**
   * Sem padding próprio: o respiro vem das margens da busca e da contagem, que são quem precisa
   * dele. Somando os dois, o topo ganhava um vão que nenhuma das duas telas tem.
   */
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
  /**
   * O aviso de lista vazia que **não** é o estado vazio da tela.
   *
   * Discreto de propósito: ou a busca não achou nada (e some ao limpar), ou só há histórico — nos
   * dois casos há conteúdo logo abaixo, e um bloco grande de "nada aqui" contradiria o que se vê.
   */
  semResultado: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingVertical: spacing.lg,
    textAlign: "center",
  },
  /** Respiro entre os próximos e o histórico: são dois assuntos, não uma lista contínua. */
  blocoAnteriores: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  /**
   * O traço que separa a agenda do histórico, igual ao da tela de adesão.
   *
   * O respiro sozinho não bastava: numa lista de cartões iguais, espaço a mais lê como item que
   * falta, e não como troca de assunto. O traço diz que ali termina "o que vem" e começa "o que
   * foi" — que é a diferença entre agenda e registro.
   */
  divisorDeEscopo: {
    height: 1,
    backgroundColor: cores.outlineVariant,
  },
  /**
   * O acordeão com a superfície dos cartões da tela.
   *
   * O padrão dele (`surfaceContainerLow`) quase empata com o fundo, e no meio de uma lista de
   * cartões ele desapareceria — nada diria que ali há histórico a abrir.
   */
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
  /**
   * Um quadrado fixo — largura e altura iguais, sempre 52 — e não uma caixa que respira conforme
   * o texto. "3 JAN" e "24 DEZ" ocupam o mesmo espaço; sem isso a coluna variava de item pra
   * item e a lista perdia o alinhamento vertical que faz ela ler como grade.
   */
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
  /** O texto: título e a linha de horário/local, sem competir por largura com data nem ações. */
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  /** Passado recua: já aconteceu, e a tela existe pra planejar o que vem, não pra relembrar. */
  itemPassado: {
    opacity: 0.6,
  },
  horaEProfissional: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** Editar e excluir dividindo a largura ao meio, abaixo de todo o resto do cartão. */
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
    // Alvo de toque de sobra: são as duas ações mais tocadas do cartão depois de "ver detalhe".
    minHeight: 40,
  },
  /**
   * A linha vertical entre as duas metades — bem discreta de propósito: ela só separa, não
   * precisa se notar sozinha. `outlineVariant` já é a cor mais clara de contorno do tema, e ainda
   * assim entra a 50% — o traço na cor cheia competia com o texto das duas ações ao lado.
   */
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
