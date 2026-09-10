
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  options: {
    gap: spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.gutter,
    paddingHorizontal: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.surfaceContainer, 0.5),
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  optionLabel: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  optionDescription: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    maxWidth: 300,
  },
}));
