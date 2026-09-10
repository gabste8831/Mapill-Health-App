
import { estilosDoTema, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  container: {
    ...superficieDeCartao(cores, ajustes),
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    opacity: 0.55,
  },
  linhaComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  hora: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  texto: {
    flex: 1,
  },
  nome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  nota: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
