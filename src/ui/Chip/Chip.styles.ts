
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /** `minHeight`: com altura travada, a chip recorta o próprio texto em fonte ampliada. */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    minHeight: 40,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainerLow,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  chipText: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  chipRemove: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRemoveText: {
    ...typography.label,
    color: cores.error,
    fontSize: 14,
  },
}));
