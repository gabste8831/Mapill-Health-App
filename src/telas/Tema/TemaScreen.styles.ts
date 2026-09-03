import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  hint: {
    ...typography.bodyMd,
    fontSize: 12,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.sm,
  },
}));
