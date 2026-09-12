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
   * A linha de uma permissão: ícone de estado, texto, e a seta que diz que ela abre algo.
   *
   * Fundo próprio sobre o bloco, e não separador: são alvos de toque, e o que distingue "linha
   * tocável" de "parágrafo" aqui é ter superfície. 48dp de altura mínima pelo alvo de toque.
   */
  linhaDePermissao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: withOpacity(colors.surface, 0.6),
  },
  /** Ocupa o que sobra entre o ícone de estado e a seta. */
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaTitulo: {
    ...typography.bodyMd,
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
