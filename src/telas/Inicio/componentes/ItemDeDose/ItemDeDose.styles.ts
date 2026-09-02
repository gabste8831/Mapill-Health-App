import { StyleSheet } from "react-native";

import { colors, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * O cartão de dose, agora **arredondado e com sombra** como o resto do app.
   *
   * Ele não tinha `borderRadius` nenhum: era um retângulo de canto reto com borda cinza, no meio de
   * uma tela onde tudo o mais é cartão arredondado. Era o que fazia a agenda parecer uma tabela
   * colada na Home em vez de parte dela.
   */
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    boxShadow: surfaceShadow,
  },
  /**
   * Os estados não usam mais **borda colorida de 2px**, e sim uma faixa lateral grossa.
   *
   * A borda inteira desenhava um contorno em volta do cartão, que somado ao fundo colorido dava a
   * ele o peso de um alerta de sistema — três desses na agenda e a tela vira um painel de avisos.
   * A faixa à esquerda diz a mesma coisa com um gesto só, e é a mesma linguagem que a `Dica` e os
   * blocos de permissão já usam.
   */
  highlighted: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  /**
   * Atrasada usa a cor de erro, e não a de atenção: é a única linha da agenda que representa algo
   * que já deveria ter acontecido e não aconteceu (decisão nº11.5 — ela nunca se resolve sozinha,
   * então precisa continuar pedindo resposta).
   */
  late: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  /**
   * "É agora" ganha o mesmo peso da atrasada: as duas pedem ação imediata, e é essa diferença —
   * pede agora × está na fila — que o destaque precisa carregar. O que separa uma da outra é a cor.
   *
   * O fundo é o verde **diluído**, e não o `successContainer` cheio: aquele era vibrante demais
   * para uma linha de lista, e competia com o vermelho da atrasada logo acima — dois blocos
   * saturados lado a lado anulam a hierarquia que as cores deviam criar.
   */
  now: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    backgroundColor: colors.successSurface,
  },
  done: {
    opacity: 0.5,
  },
  /**
   * Hora, estado, nome e dose num nó só para o leitor de tela — e por isso também um bloco só no
   * layout, ocupando o espaço que sobra antes dos botões.
   */
  infoAgrupada: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  timeColumn: {
    minWidth: 64,
  },
  time: {
    ...typography.label,
    textTransform: "none",
    fontSize: 16,
    color: colors.onSurface,
  },
  statusLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.primary,
  },
  statusLabelUpcoming: {
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  statusLabelNow: {
    color: colors.onSuccessContainer,
  },
  statusLabelLate: {
    color: colors.onErrorContainer,
  },
  content: {
    flex: 1,
  },
  medicationName: {
    ...typography.headlineSm,
    fontSize: 16,
    color: colors.onSurface,
  },
  /** Só a pulada é riscada: a tomada não é uma tarefa cancelada, é uma tarefa cumprida. */
  medicationNameSkipped: {
    textDecorationLine: "line-through",
  },
  note: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  actions: {
    gap: spacing.sm,
    alignItems: "stretch",
  },
  /**
   * Pílula, e não retângulo de canto suave: acompanha as fichinhas de horário do resto do app.
   *
   * `minHeight: 44` porque o padding sozinho dava **32pt** (16 de linha + 8 + 8), e estes são os
   * dois alvos mais tocados do aplicativo — a agenda do dia é a tela onde a dose se confirma. Dois
   * alvos pequenos empilhados a 8px um do outro convidam a confirmar quando se queria pular, e
   * errar o toque aqui **falseia o registro clínico**: grava uma dose que não foi tomada.
   *
   * Escapou da varredura de 31/08 porque aquela corrigiu o kit (`Button`, `TextField`), e estes
   * botões são desenhados pela própria tela.
   */
  confirmButton: {
    backgroundColor: colors.primary,
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  confirmButtonText: {
    ...typography.label,
    color: colors.onPrimary,
    textAlign: "center",
  },
  /**
   * "Pular" é discreto de propósito: é uma saída legítima, não um atalho a ser incentivado.
   *
   * Fundo suave no lugar da borda cinza — mesma razão dos cartões: contorno de 1px sobre superfície
   * clara lê como campo de formulário, e aqui é um botão.
   */
  skipButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  skipButtonText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
});
