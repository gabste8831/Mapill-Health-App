import { StyleSheet } from "react-native";

import {
  colors,
  gapEntreSecoes,
  radius,
  screenPadding,
  spacing,
  typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: gapEntreSecoes,
  },
  abertura: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  secao: {
    gap: spacing.sm,
  },
  secaoTitulo: {
    ...typography.label,
    color: colors.primary,
  },
  texto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
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
    color: colors.primary,
  },
  limiteTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
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
   * linhas passam a ser os únicos elementos com contorno, que é o que as faz ler como botões.
   */
  condicoes: {
    gap: spacing.xs,
  },
  condicoesTitulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  condicoesParagrafo: {
    marginTop: spacing.sm,
  },
  /**
   * A linha de uma permissão — desenhada como **botão**, e não como item de lista.
   *
   * ## Por que borda, e não fundo
   *
   * Ela tinha `surface` a 60% sobre o bloco, e isso dava **1,11:1** de contraste (medido). Branco
   * cravado daria 1,18. Nenhum dos dois se distingue do bloco: as duas superfícies são claras, e
   * empilhar clarinho sobre clarinho não produz contorno nenhum. Era por isso que a linha não lia
   * como algo clicável, apontado pelo Gabriel em 12/09.
   *
   * A borda resolve porque ela não depende de diferença entre fundos.
   *
   * ## Por que `outline`, e não `outlineVariant`
   *
   * A borda é **cinza** por pedido do Gabriel em 12/09: azul disputava com o aviso da Home, e
   * aquele é o que de fato leva a outro lugar. Mas o primeiro cinza que entrou aqui foi
   * `outlineVariant`, e medido ele dá **1,38:1** contra a linha — pior que a borda azul que saiu, e
   * longe dos 3:1 da WCAG 1.4.11.
   *
   * O motivo é que `surface` e `background` são **a mesma cor** neste tema (`#F1F4F8`): a linha não
   * tem preenchimento que a separe da página, então a borda carrega o contorno sozinha. É aqui que
   * esta linha difere do aviso da Home, que ela imita — lá existe `primarySurface` por baixo, e a
   * borda discreta só acompanha um bloco que já se distingue.
   *
   * `outline` dá **4,38:1** (medido) e continua inequivocamente cinza: atende o pedido e mantém o
   * contorno visível para quem mais precisa dele.
   *
   * ## As medidas
   *
   * 56dp de altura mínima, acima dos 44 do projeto: esta é a tela mais difícil do app para o
   * público mais velho, e o alvo maior é a acomodação mais baratas que existe. `gap` maior pelo
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
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    /**
     * Cinza neutro, na medida que se vê: ver o bloco acima para o porquê de `outline` e não
     * `outlineVariant`. Quem diz que a linha abre algo é a seta à direita; a borda só delimita.
     */
    borderWidth: 1,
    borderColor: colors.outline,
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
   * O nome da permissão: corpo de leitura com peso de rótulo.
   *
   * Cheguei a subir para 18px, e com a borda discreta ficou desproporcional — texto grande em caixa
   * leve lê como título de seção, não como botão. `bodyMd` em semibold dá a mesma hierarquia dentro
   * da linha sem competir com o rótulo da seção acima.
   */
  linhaTitulo: {
    ...typography.bodyMd,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: colors.onSurface,
  },
  /** O passo dentro da tela do sistema — onde procurar depois que ela abrir. */
  linhaComoFazer: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
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
    color: colors.success,
  },
  linhaPendente: {
    ...typography.bodySm,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: colors.error,
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
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
