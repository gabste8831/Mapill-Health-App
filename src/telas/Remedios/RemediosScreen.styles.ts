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
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: bottomTabInset + spacing.xxl,
  },

  // --- Item da lista ---
  item: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    // Mesma sombra do `Card` do kit, pra lista e formulário terem a mesma superfície.
    boxShadow: "0px 1px 3px rgba(25, 28, 30, 0.08)",
    padding: spacing.md,
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainer,
  },
  itemHeaderText: {
    flex: 1,
  },
  acoes: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  acaoBotao: {
    padding: spacing.xs,
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
    gap: spacing.xs,
  },
  timeChip: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  timeChipText: {
    ...typography.label,
    color: colors.onSecondaryContainer,
    letterSpacing: 0.3,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
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
