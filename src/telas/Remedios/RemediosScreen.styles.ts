import { StyleSheet } from "react-native";

import { bottomTabInset, colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /** Alvo de toque de 44px sem empurrar o título — o recuo compensa o padding interno. */
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  contagem: {
    ...typography.label,
    color: colors.onSurfaceVariant,
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  photoFallback: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  photoFallbackText: {
    ...typography.headlineSm,
    color: colors.onSecondaryContainer,
  },
  itemHeaderText: {
    flex: 1,
    gap: spacing.xs,
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
