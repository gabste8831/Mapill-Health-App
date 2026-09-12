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
 * Reativa ao tema desde 12/09 — antes era `StyleSheet.create` com a paleta lida na importação.
 *
 * Este arquivo era o maior devedor do app (15 ocorrências no `scripts/tema-pendente.mjs`), e a
 * consequência não era estética: `StyleSheet.create` roda uma vez, quando o módulo é importado, e
 * as cores lidas ali ficam congeladas. Quem trocasse para o tema escuro ou para o alto contraste
 * continuava vendo esta tela no tema claro — texto quase branco sobre fundo quase branco, na tela
 * que trata do assunto mais difícil do app. O Gabriel apontou em 12/09.
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
   * importantes da tela — as que impedem alguém de confiar no app para algo que ele não faz — e
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
   * Tinha `secondaryContainer` a 45%, e com as linhas ganhando superfície branca por dentro o
   * resultado era caixa dentro de caixa — três níveis de fundo em quatro pixels. É o que fazia a
   * tela parecer pesada apesar de cada peça estar correta (apontado em 12/09).
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
   * A linha de uma permissão — desenhada como **superfície elevada**, igual às linhas de Ajustes.
   *
   * ## Por que sombra, e não borda
   *
   * Esta linha passou por quatro tentativas em 12/09, e as três primeiras erraram por insistir em
   * borda: `surface` a 60% sobre o bloco dava **1,11:1** (medido); depois azul cheio, que gritava
   * em cinco linhas empilhadas; depois cinza `outlineVariant`, que dá **1,38:1** porque `surface` e
   * `background` são a mesma cor no tema claro — a linha não tinha preenchimento que a separasse da
   * página, e a borda sustentava o contorno sozinha.
   *
   * A regra do app resolve isso e é anterior a tudo: **sombra e nunca borda** (21/08). Uma borda de
   * 1px faz o bloco parecer caixa desenhada de formulário HTML; o que separa uma superfície do fundo
   * é ela estar *acima* dele. `surfaceContainerLowest` dá o branco que `surface` não dava, e a
   * sombra faz a elevação — é exatamente o `Card` de Ajustes, que foi o pedido do Gabriel.
   *
   * ## E no alto contraste
   *
   * `fronteiraDeSuperficie` troca a sombra por contorno quando o tema pede. Isso não é detalhe:
   * a regra da sombra pressupõe enxergar 8% de opacidade, e quem escolheu alto contraste não
   * enxerga — ali a sombra não é discrição, é a fronteira apagada. O helper é o mesmo que o `Card`
   * usa, então as duas telas continuam iguais nos três temas em vez de divergirem na próxima
   * mudança.
   *
   * ## As medidas
   *
   * 56dp de altura mínima, acima dos 44 do projeto: esta é a tela mais difícil do app para o
   * público mais velho, e o alvo maior é a acomodação mais barata que existe. `gap` maior pelo
   * mesmo motivo — dedo grosso em alvo apertado erra a linha vizinha.
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
   * Ela já se distingue pelo ícone verde e pela palavra "Autorizada" — dois sinais independentes,
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
   * Cheguei a subir para 18px, e com a superfície discreta ficou desproporcional — texto grande em
   * caixa leve lê como título de seção, não como botão.
   *
   * `500Medium` e não `600SemiBold`: com a linha agora sobre superfície branca e elevada, é a
   * própria superfície que diz "isto é um botão", e o semibold em cima virava ênfase repetida. Um
   * degrau abaixo mantém a hierarquia dentro da linha sem o peso que o Gabriel apontou em 12/09.
   */
  linhaTitulo: {
    ...typography.bodyMd,
    fontFamily: "PlusJakartaSans_500Medium",
    color: cores.onSurface,
  },
  /**
   * O passo dentro da tela do sistema — onde procurar depois que ela abrir.
   *
   * Sem itálico (pedido do Gabriel em 12/09): em bloco pequeno ele custa legibilidade justamente
   * para quem mais precisa desta instrução, e o que separa esta linha do título já é o tamanho e a
   * cor. Itálico aqui era decoração sobre distinção que já existia.
   */
  linhaComoFazer: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  /**
   * O estado em palavra, e não só em cor.
   *
   * Verde e vermelho sozinhos excluem quem não distingue as duas — e este é o assunto mais difícil
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
  /**
   * O placar de progresso saiu em 12/09, junto dos seus estilos.
   *
   * Ele dizia "2 de 3 ainda faltam", e o denominador era o número de autorizações **verificáveis** —
   * as únicas que o app sabe contar. Quem lia concluía que três era o total, e que zerar aquele
   * número deixava o app pronto; o total honesto é cinco. É o mesmo engano que tirou a lista de
   * permissões da Home no mesmo dia, e qualquer progresso aqui o repetiria.
   */

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
