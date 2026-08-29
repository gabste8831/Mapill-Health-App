import { StyleSheet } from "react-native";

import { bottomTabInset, colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /**
   * A grade dentro do scroll precisa desfazer o `paddingHorizontal` dele: a faixa azul vai de borda
   * a borda, e recuada deixaria o fundo aparecendo dos dois lados. O `paddingTop` do scroll também
   * é anulado — a faixa encosta no cabeçalho, como quando ela era fixa.
   */
  gradeNoScroll: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.sm,
  },

  /**
   * Entre a grade e a lista: o filtro governa as duas, então fica entre elas — e é o único que
   * gruda no topo quando a página rola. Fundo opaco e não transparente por causa disso: grudado
   * sem fundo, a lista passaria por baixo dele.
   */
  filtros: {
    // Sangra até as bordas e devolve o recuo por dentro: grudado, o fundo precisa cobrir a largura
    // inteira, senão a lista aparece passando pelas laterais.
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  /**
   * Sem `gap`: a grade, o filtro grudado e a lista precisam de respiros diferentes, e um espaço
   * uniforme obrigava o filtro a flutuar longe do que ele filtra. Cada bloco declara o seu.
   */
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  // --- Item da lista ---
  item: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    padding: spacing.md,
    gap: spacing.xs,
  },
  /** Compromisso que já aconteceu continua legível, mas para de disputar atenção com o que vem. */
  itemPassado: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * A hora do compromisso, na mesma largura da hora das doses logo abaixo. O alinhamento é o que
   * faz o dia se ler como uma linha do tempo, e não como dois blocos que por acaso ficaram juntos.
   */
  horaDoCompromisso: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    width: 44,
  },
  itemHeaderText: {
    flex: 1,
  },
  tipo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  quando: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  acoes: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  acaoBotao: {
    padding: spacing.xs,
  },

  detalhe: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  observacao: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  rodapeDoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  aviso: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },

  /**
   * A pergunta que fica devendo resposta num compromisso que já passou. Fundo neutro e não de
   * alerta: não responder não é erro, e o app não sabe se a pessoa foi ou não.
   */
  perguntaDeDesfecho: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  perguntaTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  botoesDeDesfecho: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoDeDesfecho: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // 44 é o piso de alvo de toque confortável; abaixo disso a linha vira armadilha em tela
    // pequena, e o público do app inclui quem já não acerta um toque preciso.
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  botaoDeDesfechoTexto: {
    ...typography.label,
    color: colors.onSurface,
  },

  /** O desfecho já respondido, com a cor dizendo qual foi antes de a palavra ser lida. */
  desfecho: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  desfechoTexto: {
    ...typography.label,
    flex: 1,
  },
  desfechoCompareceu: {
    color: colors.primary,
  },
  desfechoFaltou: {
    color: colors.error,
  },
  /** A anotação do que aconteceu — o que vale a longo prazo, e por isso não fica em cinza fraco. */
  anotacaoDoDesfecho: {
    ...typography.bodyMd,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  sheetBody: {
    gap: spacing.md,
  },

  /** Um dia inteiro da agenda: o cabeçalho, os compromissos e o bloco de doses. */
  dia: {
    gap: spacing.sm,
    // Separa do filtro grudado logo acima, agora que o `listContent` não tem mais `gap` uniforme.
    marginTop: spacing.sm,
  },

  /**
   * O "nada marcado" tem respiro próprio, e maior que o `gap` do dia. Ele não é mais um item da
   * lista: é a ausência dela, e colado no cabeçalho do dia parecia legenda do título. O ar em
   * volta é o que faz a frase ler como resposta à pergunta "o que tem hoje?".
   */
  vazioDoDia: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  // --- Cabeçalho de dia ---
  /**
   * O dia é o agrupador da agenda, então ele precisa de peso próprio — sem isso a lista vira uma
   * fileira de cartões onde não se enxerga onde um dia termina e o outro começa.
   */
  diaHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  diaTitulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  diaHoje: {
    color: colors.primary,
  },
  diaData: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  // --- Bloco de doses do dia ---
  blocoDeDoses: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linhaDeDose: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  /** Divisória entre doses do mesmo dia — mais leve que um cartão por dose. */
  linhaComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  horaDaDose: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    width: 44,
  },
  textoDaDose: {
    flex: 1,
  },
  nomeDaDose: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  quantidadeDaDose: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /** Dose já confirmada continua visível, mas para de disputar atenção com o que falta responder. */
  doseResolvida: {
    opacity: 0.55,
  },
  acoesDaDose: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  botaoDaDose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },

  // --- Estados ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: "center",
    maxWidth: 320,
  },
});
