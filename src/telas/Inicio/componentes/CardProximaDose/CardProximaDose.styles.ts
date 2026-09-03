
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.7,
  },
  time: {
    ...typography.headlineXlBold,
    color: cores.onPrimary,
  },
  medication: {
    ...typography.bodyLg,
    color: cores.onPrimary,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onPrimary, 0.2),
  },
  hintText: {
    ...typography.label,
    textTransform: "none",
    color: cores.onPrimary,
    opacity: 0.85,
  },
}));
