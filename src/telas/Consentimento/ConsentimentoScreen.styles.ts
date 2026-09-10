
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.gutter,
    gap: 28,
    paddingBottom: spacing.xxl,
  },
  purposeText: {
    ...typography.bodySm,
    color: cores.outline,
  },
  divider: {
    width: "90%",
    alignSelf: "center",
    height: 1,
    backgroundColor: cores.outlineVariant,
    opacity: 0.5,
  },
  highlightList: {
    gap: spacing.sm,
  },
  highlightDescription: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },
  legalSectionsGroup: {
    gap: spacing.sm,
  },
  consentGroup: {
    gap: spacing.md,
  },
}));
