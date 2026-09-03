
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },

  /**
   * O número grande, que é o que a pessoa veio ver — e o que ela vai mostrar ao médico.
   *
   * Em azul cheio, e não em cartão branco: é o único dado que esta tela existe para entregar, e
   * sobre branco ele era texto grande solto no meio de outros cartões brancos. A cor aqui não é
   * decoração — é o que diz qual dos blocos da tela é a resposta.
   */
  destaque: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  /** 48 e nao um token: numero de exibicao, unico no app. Criar token para um uso so infla a escala. */
  destaqueTaxa: {
    ...typography.headlineMd,
    fontSize: 48,
    lineHeight: 56,
  },
  destaqueLegenda: {
    ...typography.bodyMd,
    color: withOpacity(cores.onPrimary, 0.85),
  },

  /**
   * As três faixas de cor. Só a cor muda — nunca o tamanho, nem o ícone, nem uma mensagem de
   * incentivo. A cor orienta a leitura; o julgamento fica com o médico.
   *
   * Valem na **lista por medicamento**, que segue sobre fundo branco. O número em destaque agora
   * mora no bloco azul e é branco: nenhuma das três teria contraste ali, e um número vermelho
   * dentro de um bloco azul leria como erro do aplicativo em vez de informação sobre o tratamento.
   * A distinção que a cor dava está na legenda logo abaixo — quantas de quantas, que é mais preciso
   * que uma faixa.
   */
  taxa_boa: {
    color: cores.success,
  },
  taxa_media: {
    color: cores.onWarningSurface,
  },
  taxa_baixa: {
    color: cores.error,
  },
  /** O número dentro do bloco azul. */
  destaqueTaxaTexto: {
    color: cores.onPrimary,
  },

  contagens: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  /**
   * Os três cartõezinhos lado a lado mantêm `padding: md`, e não o `gutter` do `superficieDeCartao`: em
   * três colunas numa tela de celular, 24 de respiro interno não sobra largura para o número.
   */
  contagem: {
    ...superficieDeCartao(cores, ajustes),
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  contagemValor: {
    ...typography.headlineMd,
    color: cores.onSurface,
  },
  contagemRotulo: {
    ...typography.label,
    color: cores.onSurface,
  },
  /** A explicação em letra menor: o rótulo sozinho não distingue "pulada" de "sem resposta". */
  contagemDica: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  linha: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  linhaDetalhe: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  linhaTaxa: {
    ...typography.headlineSm,
  },

  /**
   * Aqui a linha divisória fica: são registros curtos e repetidos, não cartões — vinte deles em
   * cartão separado viram uma escada. O traço só clareou, porque `outlineVariant` num divisor
   * interno pesa como moldura de tabela.
   */
  perdida: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.surfaceContainerHigh,
  },
  perdidaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /**
   * Cinza, e não vermelho. A lista inteira já é de doses não tomadas — pintar cada linha de erro
   * transformaria um registro clínico numa fileira de repreensões, e quem lê isso sobre a própria
   * semana tende a parar de registrar em vez de parar de esquecer.
   */
  perdidaSelo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  rodape: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
  },

  /**
   * A linha que abre o seletor de medicamentos — mesma anatomia do resumo de estoque no cadastro:
   * rótulo em cima, o que está escolhido embaixo, e o toque abre o popup. O estado atual fica
   * legível sem abrir nada, que é o que evita gerar um relatório recortado sem perceber.
   */
  filtro: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
  },
  filtroRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  filtroValor: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },

  /** O conteúdo do popup de seleção. */
  folha: {
    gap: listGap,
  },
  folhaAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  folhaAcao: {
    flex: 1,
  },
  folhaItem: {
    paddingVertical: spacing.xs,
  },
}));
