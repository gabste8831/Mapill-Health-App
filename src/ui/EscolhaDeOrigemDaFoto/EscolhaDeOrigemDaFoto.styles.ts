
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  body: {
    gap: spacing.sm,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: cores.surfaceContainerLow,
    // 64 dá folga de dedo numa escolha que é feita uma vez e não pode errar de linha.
    minHeight: 64,
  },
  texto: {
    flex: 1,
  },
  rotulo: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  dica: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
