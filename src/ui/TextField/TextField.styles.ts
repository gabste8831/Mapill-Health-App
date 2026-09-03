
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  requiredMark: {
    color: cores.error,
  },
  /**
   * `minHeight`, e não `height`: com a altura travada o texto digitado é recortado quando a fonte
   * do sistema está ampliada — e é o público deste app que mais usa esse ajuste do Android.
   */
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  inputError: {
    borderColor: cores.error,
  },
  fieldErrorText: {
    ...typography.bodySm,
    color: cores.error,
  },
}));
