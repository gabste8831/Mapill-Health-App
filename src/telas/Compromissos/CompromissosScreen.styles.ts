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
  listHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  // --- Item da lista ---
  item: {
    ...superficieDeCartao(cores, ajustes),
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
