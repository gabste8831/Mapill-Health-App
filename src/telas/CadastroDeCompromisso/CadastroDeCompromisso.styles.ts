
import { estilosDoTema, radius, screenPadding, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyLg,
    color: cores.onSurfaceVariant,
  },
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    color: cores.onErrorContainer,
    backgroundColor: cores.errorContainer,
  },
  seloOpcional: {
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.6),
  },
  hint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  confirmacao: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },
  aviso: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    backgroundColor: cores.warningSurface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  erro: {
    ...typography.bodySm,
    color: cores.onWarningSurface,
  },
  campoLivre: {
    flexGrow: 1,
    minWidth: 72,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  campoLivreAtivo: {
    borderColor: cores.primary,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.4),
  },
  submitHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
