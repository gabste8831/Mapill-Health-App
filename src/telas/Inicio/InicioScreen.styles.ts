
import { bottomTabInset, estilosDoTema, gapEntreSecoes, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: gapEntreSecoes,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  greetingRow: {
    gap: spacing.gutter,
    paddingTop: spacing.gutter,
  },
  greetingText: {
    gap: spacing.sm,
  },
  dateLabel: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  greeting: {
    ...typography.headlineXl,
    color: cores.onSurface,
  },
  progressBlock: {
    gap: spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  progressLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  progressValue: {
    ...typography.headlineSm,
    color: cores.corDeDestaque,
  },
  progressTrack: {
    height: 8,
    backgroundColor: cores.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: cores.primary,
  },
  progressCaption: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  doseList: {
    gap: listGap,
  },
  sectionLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  bulkAction: {
    ...typography.label,
    color: cores.corDeDestaque,
    paddingVertical: spacing.xs,
  },
  emptyState: {
    ...superficieDeCartao(cores, ajustes),
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
  },
  erroInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: cores.error,
    backgroundColor: cores.errorSurface,
  },
  erroAcao: {
    ...typography.label,
    color: cores.onErrorSurface,
  },
}));
