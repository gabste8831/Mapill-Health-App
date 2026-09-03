
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  /** Mesma razão do `TextField`: altura travada recorta o valor escolhido em fonte ampliada. */
  selectField: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectFieldValue: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  selectFieldPlaceholder: {
    ...typography.bodyLg,
    color: cores.onSurfaceVariant,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  modalOptionText: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  modalOptionTextSelected: {
    ...typography.bodyLg,
    color: cores.corDeDestaque,
  },
  modalOptionTextMuted: {
    ...typography.bodyLg,
    color: cores.onSurfaceVariant,
  },
}));
