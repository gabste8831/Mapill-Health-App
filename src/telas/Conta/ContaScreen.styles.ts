
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: withOpacity(cores.corDeDestaque, 0.08),
  },
  introIcone: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.corDeDestaque, 0.12),
  },
  introTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    paddingLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
  },
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  rowLabelDestrutiva: {
    color: cores.error,
  },
  sectionFooter: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
  },
  rowHint: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
}));
