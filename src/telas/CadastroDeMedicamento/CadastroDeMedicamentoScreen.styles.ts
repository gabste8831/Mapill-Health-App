import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
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
  seloOpcional: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurfaceVariant,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  emptyHint: {
    ...typography.bodyMd,
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

  /** Quantidade e unidade lado a lado: são uma informação só, lida em conjunto ("1 comprimido"). */
  doseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  doseAmountField: {
    flex: 1,
  },
  doseUnitField: {
    flex: 1.4,
  },

  timeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
  },
  timeChipText: {
    ...typography.bodyLg,
    color: colors.onSecondaryContainer,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  timeInputField: {
    flex: 1,
  },
  timeAddButton: {
    paddingHorizontal: spacing.gutter,
  },

  weekdayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  weekday: {
    minWidth: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
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
});
