import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    // Só respiro: o botão saiu do fim da rolagem e virou rodapé fixo, então não há mais o que
    // reservar aqui embaixo.
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurface,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  selo: {
    ...typography.label,
    fontSize: 10,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  // Canto quadrado, diferente do avatar redondo da ficha: aqui é a caixa do remédio, não retrato.
  photoFrame: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  /** As duas maneiras de anexar a receita, lado a lado — são alternativas, não sequência. */
  acoesDeAnexo: {
    flexDirection: "row",
    gap: spacing.md,
  },
  photoTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  photoAddLabel: {
    ...typography.label,
    color: colors.primary,
  },
  photoHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * Dois campos que se leem juntos numa frase — "08:00, 10 unidades", "21 dias tomando, 7 de
   * pausa". Separá-los em linhas faria cada metade parecer uma pergunta independente.
   */
  linhaDeDose: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campoDeHorario: {
    flex: 1,
  },
  campoDeQuantidade: {
    flex: 1,
  },
  campoDeCiclo: {
    flex: 1,
  },

  /** Linha "valor atual + ação" — o resumo de uma escolha que se resolve em outro lugar. */
  rowValue: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  /**
   * A mesma linha, quando o que ela resume já está ligado. Fundo só pra separar "isto está
   * ativo" de "isto é um campo" — a linha nua se confundia com o rótulo da seção logo acima.
   */
  rowValueAtivo: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.5),
  },
  rowValueText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  rowValueAction: {
    ...typography.label,
    color: colors.primary,
  },

  /** Resumo do que já foi definido no popup — fichinhas, no mesmo cinza dos botões de escolha. */
  timeChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
  },
  timeChipVazio: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    backgroundColor: "transparent",
  },
  timeChipErro: {
    backgroundColor: colors.errorContainer,
  },
  timeChipText: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  /**
   * O último lugar da fileira de "quantas vezes por dia": as opções cobrem o comum e este campo
   * cobre o resto, sem gastar um segundo toque nem uma segunda linha.
   */
  dosesInput: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlign: "center",
  },
  dosesInputAtivo: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },

  /** Os sete dias numa linha só, ocupando a largura toda — a semana se lê de uma vez ou não se lê. */
  weekdayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  weekday: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
  },
  weekdaySelected: {
    backgroundColor: colors.primary,
  },
  weekdayText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  weekdayTextSelected: {
    color: colors.onPrimary,
  },

  submitHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  fieldErrorText: {
    ...typography.bodyMd,
    color: colors.error,
  },
  /**
   * Duas informações que o paciente deu e que não fecham entre si: estoque menor que o
   * tratamento, prazo que não alcança dose nenhuma, antecedência maior que o estoque.
   *
   * Vermelho, e não o laranja de atenção que estava aqui antes. Não porque o campo seja
   * inválido, mas porque a combinação não funciona do jeito que foi pedida, e laranja no meio de
   * texto cinza lia como enfeite. O app continua deixando salvar; quem decide é o paciente.
   */
  avisoDeConflito: {
    ...typography.bodyMd,
    color: colors.error,
    backgroundColor: withOpacity(colors.error, 0.08),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /** Explicação que não é campo nem erro — texto de apoio que merece peso, tipo regra do sistema. */
  sectionHintDestaque: {
    ...typography.bodyMd,
    color: colors.onSecondaryContainer,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /**
   * O conteúdo do "como funcionam" inteiro, num fundo azul claro. É explicação, não campo nem
   * alerta: o fundo separa esse registro do resto do popup sem usar a cor de atenção, que
   * gritaria por uma leitura tranquila.
   */
  blocoDeAjuda: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.45),
  },
  /**
   * Um assunto, com título curto e o texto. Título e não lista corrida: quem abre o acordeão
   * está procurando uma resposta específica, e o título é o que deixa varrer sem ler tudo.
   */
  assuntoDeAjuda: {
    gap: spacing.xs,
  },
  assuntoDeAjudaTitulo: {
    ...typography.label,
    color: colors.onSecondaryContainer,
  },
  assuntoDeAjudaTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * Azul junto do resto da explicação, e não a cor de conflito: depois que o texto virou
   * condição ("com permissão e volume, os alertas chegam"), pintá-lo de alerta contradiria o
   * que ele diz. Vermelho fica reservado para o que realmente não fecha.
   */
  avisoDePermissao: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(colors.secondaryContainer, 0.45),
  },
  avisoDePermissaoTitulo: {
    ...typography.label,
    color: colors.onSecondaryContainer,
  },
  avisoDePermissaoTexto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /**
   * Resumo de uma configuração feita em popup. Rótulo e valor em colunas, porque "50 comprimidos
   * · em cima da geladeira" numa linha só obriga a decifrar o que é o quê pelo conteúdo.
   */
  resumoBloco: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  resumoRotulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    width: 96,
  },
  resumoValor: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  sheetBody: {
    gap: spacing.md,
  },

  /**
   * A virada de "só o essencial" para "o resto também". Acontece uma vez só, e é anunciada: se
   * cada seção nascesse conforme o paciente digita, a tela pularia debaixo do dedo e ninguém
   * perceberia que algo apareceu.
   */
  revelacao: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  revelacaoTitulo: {
    ...typography.bodyLg,
    color: colors.primary,
    textAlign: "center",
  },
  revelacaoHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  /** Saída de uma configuração já ligada — discreta, porque desligar é exceção e não atalho. */
  textoDeSaida: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },

  /**
   * Rodapé fixo: o botão precisa estar à vista o tempo todo pra dizer, sem texto, que dá pra
   * parar de preencher a qualquer momento.
   */
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
});
