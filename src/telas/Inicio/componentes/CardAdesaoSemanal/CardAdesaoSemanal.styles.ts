
import { estilosDoTema, spacing, superficieDeCartao, typography } from "@/shared/theme";

const BAR_ROW_HEIGHT = 80;

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  container: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    height: BAR_ROW_HEIGHT,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    backgroundColor: cores.primary,
    borderRadius: 2,
    opacity: 0.2,
  },
  barToday: {
    opacity: 1,
  },
  /** Traço fino de "não havia dose", visualmente distinto de uma barra curta. */
  barVazia: {
    height: 2,
    backgroundColor: cores.outlineVariant,
    borderRadius: 2,
  },
  labelsRow: {
    flexDirection: "row",
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    ...typography.caption,
    color: cores.onSurfaceVariant,
    opacity: 0.6,
  },
  summary: {
    ...typography.bodyMd,
    color: cores.onSurface,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
}));

export const barRowHeight = BAR_ROW_HEIGHT;
