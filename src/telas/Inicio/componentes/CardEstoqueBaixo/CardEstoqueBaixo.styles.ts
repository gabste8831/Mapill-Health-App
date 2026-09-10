
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    backgroundColor: cores.errorPreenchido,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    overflow: "hidden",
  },
  marcaDagua: {
    position: "absolute",
    right: -28,
    bottom: -32,
    opacity: 0.13,
  },
  conteudo: {
    gap: spacing.md,
  },
  seloDoRotulo: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onErrorPreenchido, 0.2),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: cores.onErrorPreenchido,
    opacity: 0.85,
  },
  medicationName: {
    ...typography.headlineMd,
    color: cores.onErrorPreenchido,
  },
  daysRemaining: {
    ...typography.bodyMd,
    color: cores.onErrorPreenchido,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: cores.onErrorPreenchido,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    ...typography.label,
    color: cores.errorPreenchido,
  },
  secondaryButton: {
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.label,
    color: cores.onErrorPreenchido,
    opacity: 0.85,
  },
}));
