import { StyleSheet } from "react-native";

import {
  colors,
  gapEntreSecoes,
  radius,
  screenPadding,
  spacing,
  typography,
  withOpacity,
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
  condicoes: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.45),
  },
  condicoesTitulo: {
    ...typography.label,
    color: colors.onSecondaryContainer,
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
   * A borda azul resolve porque ela não depende de diferença entre fundos: `primary` contra branco
   * dá **4,56:1**, acima dos 3:1 que a WCAG 1.4.11 pede para componente de interface. É o mesmo
   * azul dos outros botões do app, então ela também diz *que tipo* de coisa é.
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
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  /**
   * A linha já autorizada: **sem borda azul**, porque não há o que fazer nela.
   *
   * Ela continua tocável (a pessoa pode querer conferir ou revogar), mas não convida. Borda de
   * botão em algo resolvido competiria com as que ainda pedem ação, e é isso que faz uma lista de
   * cinco itens parecer cinco tarefas quando três já estão prontas.
   */
  linhaResolvida: {
    backgroundColor: colors.successSurface,
    // `success` cheio, e não diluído: a 45% ele dava 1,57:1 contra o branco (medido), abaixo dos
    // 3:1 que a WCAG 1.4.11 pede para a borda de um componente. Cheio dá 5,02.
    borderColor: colors.success,
  },
  /** Ocupa o que sobra entre o ícone de estado e a seta. */
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  /**
   * O nome da permissão em corpo de leitura, com peso de rótulo de botão.
   *
   * `headlineSm` e não `bodyMd`: é o que se lê primeiro na linha, e num público que pode estar sem
   * óculos 18px é o degrau que separa "consigo ler" de "vou aproximar o celular".
   */
  linhaTitulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  linhaDescricao: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
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
