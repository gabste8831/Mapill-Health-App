import { StyleSheet } from "react-native";

import {
  bottomTabInset,
  colors,
  listGap,
  radius,
  screenPadding,
  spacing,
  surfaceCard,
  typography,
} from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    // Entrelinha maior num parágrafo de apoio: é o que separa "texto que se lê" de "texto que se
    // pula", e o público do app inclui quem lê devagar.
    lineHeight: 22,
  },
  busca: {
    marginTop: spacing.md,
  },
  /**
   * O respiro fica na contagem, e não no `gap` do cabeçalho: ela é um rótulo curto logo abaixo de
   * um parágrafo, e coladas as duas linhas se leem como uma só. `gutter` afasta o suficiente pra
   * virar informação separada.
   */
  contagem: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
  /** O que rola junto com a lista: o texto de apoio e o acesso ao estoque. */
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.gutter,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: bottomTabInset + spacing.xxl,
  },

  // --- Item da lista ---
  /**
   * O cartão do kit, sem borda. A borda cinza que estava aqui era o que dava à lista o aspecto de
   * planilha: com o fundo da tela quase da mesma cor do cartão, o contorno de 1px lê como célula
   * desenhada, e não como superfície acima. `surfaceCard` traz junto o respiro maior.
   */
  item: {
    ...surfaceCard,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * A foto cresceu de 40 para 52 e ganhou canto mais redondo. Num cartão com mais respiro, a
   * miniatura pequena ficava perdida no canto — e ela é o que faz reconhecer o remédio de relance,
   * que é a razão de ela existir.
   */
  photo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  itemHeaderText: {
    flex: 1,
    gap: 2,
  },
  acoes: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  /**
   * Alvo de 40px, e não `padding: xs` sobre um ícone de 20. Num cartão de lista onde os dois
   * botões ficam lado a lado — e um deles exclui —, o alvo apertado é o que faz errar de linha.
   */
  acaoBotao: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  name: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  activeIngredient: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },

  /** Linha "1 comprimido · Todo dia" — a informação que a pessoa vem conferir. */
  posology: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },

  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  /** Fichas com mais ar: `paddingVertical: 2` deixava o horário espremido dentro da pílula. */
  timeChip: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  timeChipText: {
    ...typography.label,
    color: colors.onSecondaryContainer,
    letterSpacing: 0.3,
  },

  /**
   * Sem a linha divisória. Dentro de um cartão que já tem respiro, o traço cinza é ruído: o espaço
   * separa melhor do que o risco — mesma razão pela qual as bordas saíram dos cartões.
   */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stock: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  stockLow: {
    color: colors.error,
  },
  badge: {
    ...typography.label,
    color: colors.onSurfaceVariant,
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
