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
  /**
   * A frase de abertura, no tamanho de quem apresenta o assunto.
   *
   * Ela é o resumo de tudo o que vem depois: quem ler só isto e sair já sabe a única coisa que
   * realmente precisa saber — o alerta lembra, quem toma é a pessoa.
   */
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
   * O bloco das condições do aparelho — o texto que era o aviso "Depende do seu aparelho".
   *
   * Azul de explicação, e não a cor de atenção: ele diz o que precisa estar em ordem para o alerta
   * chegar, e pintá-lo de alerta contradiria o que ele afirma.
   */
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
  /**
   * O segundo parágrafo do bloco, separado do primeiro.
   *
   * O `gap: xs` do bloco existe para colar o título ao texto que ele encabeça; entre dois
   * parágrafos de assuntos diferentes — o que o app garante, e o que o aparelho pode atrapalhar —
   * 4px os faz ler como um só.
   */
  condicoesParagrafo: {
    marginTop: spacing.sm,
  },
  /** Alvo de dedo em volta do link para os termos — o texto sozinho tem a altura da linha. */
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
