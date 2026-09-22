import {
  estilosDoTema,
  fronteiraDeSuperficie,
  gapEntreSecoes,
  radius,
  screenPadding,
  spacing,
  typography,
} from "@/shared/theme";

/**
 * Reativa ao tema.
 *
 * A consequencia de nao responder ao tema nao era estetica: `StyleSheet.create` roda uma vez, na
 * importacao, e as cores ficam congeladas. Quem trocasse para o escuro ou o alto contraste
 * continuava vendo esta tela no claro - texto quase branco sobre fundo quase branco, na tela que
 * trata do assunto mais dificil do app.
 */
export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: gapEntreSecoes,
  },
  abertura: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  secao: {
    gap: spacing.sm,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.primary,
  },
  texto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /**
   * A lista do "o que o Mapill não faz".
   *
   * Cada limite numa linha própria, com o marcador fora do texto: são as três frases mais
   * importantes da tela - as que impedem alguém de confiar no app para algo que ele não faz - e
   * corridas num parágrafo elas se perderiam umas nas outras.
   */
  limite: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  limiteMarcador: {
    ...typography.bodyMd,
    color: cores.primary,
  },
  limiteTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    flex: 1,
  },
  /**
   * A seção de autorizações: **sem fundo próprio**, como as outras seções desta tela.
   *
   * Com fundo proprio e as linhas ganhando superficie branca por dentro, o resultado era caixa
   * dentro de caixa: tres niveis de fundo em quatro pixels, e a tela parecia pesada apesar de cada
   * peca estar correta.
   *
   * Sem o bloco, o que separa a seção é o mesmo que separa as de texto: o rótulo e o espaço. As
   * linhas passam a ser as únicas superfícies elevadas, que é o que as faz ler como botões.
   */
  condicoes: {
    gap: spacing.xs,
  },
  condicoesTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  condicoesParagrafo: {
    marginTop: spacing.sm,
  },
  /**
   * A linha de uma permissão - desenhada como **superfície elevada**, igual às linhas de Ajustes.
   *
   * Sombra, e nao borda, que e a regra do app: tentativas com borda erraram porque `surface` e
   * `background` sao a mesma cor no tema claro, e a linha ficava em 1,38:1 sem preenchimento que a
   * separasse da pagina. `surfaceContainerLowest` da o branco, e a sombra faz a elevacao.
   *
   * No alto contraste, `fronteiraDeSuperficie` troca a sombra por contorno: la a sombra nao e
   * discricao, e a fronteira apagada. O helper e o mesmo do `Card`, entao as telas nao divergem.
   *
   * As medidas
   *
   * 56dp de altura mínima, acima dos 44 do projeto: esta é a tela mais difícil do app para o
   * público mais velho, e o alvo maior é a acomodação mais barata que existe. `gap` maior pelo
   * mesmo motivo - dedo grosso em alvo apertado erra a linha vizinha.
   */
  linhaDePermissao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: cores.surfaceContainerLowest,
    ...fronteiraDeSuperficie(cores, ajustes),
  },
  /**
   * A linha autorizada **não tem estilo próprio**, e é por isso que não existe uma chave para ela.
   *
   * Ela já se distingue pelo ícone verde e pela palavra "Autorizada" - dois sinais independentes,
   * que é o que a WCAG 1.4.1 pede. Borda ou fundo verde seria o terceiro para a mesma informação, e
   * faria o resolvido chamar mais atenção que o pendente: o oposto do que a tela quer.
   */

  /** Ocupa o que sobra entre o ícone de estado e a seta. */
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  /**
   * O nome da permissão: corpo de leitura com um peso acima do texto comum.
   *
   * Cheguei a subir para 18px, e com a superfície discreta ficou desproporcional - texto grande em
   * caixa leve lê como título de seção, não como botão.
   *
   * `500Medium` e nao `600SemiBold`: com a linha sobre superficie branca e elevada, e a propria
   * superficie que diz "isto e um botao", e o semibold em cima vira enfase repetida.
   */
  linhaTitulo: {
    ...typography.bodyMd,
    fontFamily: "PlusJakartaSans_500Medium",
    color: cores.onSurface,
  },
  /**
   * O passo dentro da tela do sistema - onde procurar depois que ela abrir.
   *
   * Sem italico: em bloco pequeno ele custa legibilidade justamente para quem mais precisa desta
   * instrucao, e o que separa esta linha do titulo ja e o tamanho e a cor.
   */
  linhaComoFazer: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  /**
   * O estado em palavra, e não só em cor.
   *
   * Verde e vermelho sozinhos excluem quem não distingue as duas - e este é o assunto mais difícil
   * do app para o público mais velho. "Autorizada" e "Falta autorizar" dizem o mesmo que o ícone,
   * em texto, e sobrevivem a qualquer forma de daltonismo.
   */
  linhaOk: {
    ...typography.bodySm,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: cores.success,
  },
  linhaPendente: {
    ...typography.bodySm,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: cores.error,
  },
  // Nao ha placar de progresso: o denominador so poderia contar as verificaveis, e quem lesse
  // concluiria que zerar aquele numero deixava o app pronto, quando o total honesto e cinco.
  alvoDeLink: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.md,
  },
  linkParaTermos: {
    ...typography.bodyMd,
    color: cores.primary,
    textDecorationLine: "underline",
  },
}));
