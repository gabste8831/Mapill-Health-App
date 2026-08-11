import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  selectField: {
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectFieldValue: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  selectFieldPlaceholder: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(25, 28, 30, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    paddingBottom: spacing.xs,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  modalOptionText: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  modalOptionTextSelected: {
    ...typography.bodyLg,
    color: colors.primary,
  },
  modalOptionTextMuted: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
});
