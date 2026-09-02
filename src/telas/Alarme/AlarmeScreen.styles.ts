import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceCard, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * Fundo **azul cheio**, e não o cinza claro do resto do app.
   *
   * É a única tela do Mapill que não parece o Mapill, e isso é intencional: ela irrompe sobre a
   * tela de bloqueio, muitas vezes no escuro, e precisa ser reconhecida em meio segundo como "o
   * alarme do remédio" — não como mais uma tela do aplicativo. A cor cheia também separa o que
   * exige resposta agora do que se consulta com calma.
   */
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  conteudo: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xl,
  },

  cabecalho: {
    alignItems: "center",
    gap: spacing.md,
  },
  icone: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    // Branco translúcido sobre o azul: o ícone se destaca sem precisar de uma segunda cor.
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  titulo: {
    ...typography.headlineMd,
    color: colors.onPrimary,
    textAlign: "center",
  },
  /** A hora em tamanho de relógio: quem acorda com o alarme quer saber que horas são. */
  hora: {
    ...typography.headlineXl,
    fontSize: 56,
    lineHeight: 64,
    color: colors.onPrimary,
  },

  lista: {
    gap: spacing.md,
  },
  /**
   * Cartão branco sobre o azul, com o nome em corpo grande.
   *
   * A pessoa pode estar sem óculos, no escuro, recém-acordada — e o que ela precisa ler aqui
   * decide se vai tomar o remédio certo. É o texto mais importante do aplicativo inteiro.
   */
  item: {
    ...surfaceCard,
    gap: spacing.xs,
  },
  nome: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  quantidade: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  orientacao: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    lineHeight: 26,
  },

  /**
   * Os botões, com respiro entre eles.
   *
   * `gap` maior que o padrão de propósito: são ações que decidem um registro clínico, tomadas por
   * alguém que acabou de acordar. Encostados, o dedo erra — e errar aqui grava "pulei" no lugar de
   * "tomei", num histórico que o médico vai ler.
   */
  acoes: {
    gap: spacing.md,
  },
  /** Fica no lugar do botão de silenciar, para a lista de ações não pular quando ele some. */
  silenciadoAviso: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    textAlign: "center",
    opacity: 0.85,
    paddingVertical: spacing.md,
  },
});
