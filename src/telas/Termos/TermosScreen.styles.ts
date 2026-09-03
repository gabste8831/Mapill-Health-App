
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  statusList: {
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  statusValue: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  statusText: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  statusHint: {
    ...typography.bodyMd,
    color: cores.outline,
  },
}));
