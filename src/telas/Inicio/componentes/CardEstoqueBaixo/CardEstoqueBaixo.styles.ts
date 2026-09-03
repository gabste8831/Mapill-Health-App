
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    backgroundColor: cores.error,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: cores.onError,
    opacity: 0.85,
  },
  medicationName: {
    ...typography.headlineMd,
    color: cores.onError,
  },
  daysRemaining: {
    ...typography.bodyMd,
    color: cores.onError,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: cores.onError,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    ...typography.label,
    color: cores.error,
  },
  secondaryButton: {
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.label,
    color: cores.onError,
    opacity: 0.85,
  },
}));
