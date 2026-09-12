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
   * O placar do topo: quantas faltam, num bloco que se lê de relance.
   *
   * É o primeiro elemento da tela por decisão de 12/09 — quem abre aqui está tentando fazer o
   * alarme funcionar, e atravessar quatro seções de texto antes de achar o que resolve é desistir no
   * meio. Ícone grande, uma frase, e o que fazer.
   */
  placarPendente: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.error, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.35),
  },
  placarOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.success, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(colors.success, 0.35),
  },
  placarTexto: {
    flex: 1,
    gap: 2,
  },
  placarTitulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  placarDescricao: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
  },
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
