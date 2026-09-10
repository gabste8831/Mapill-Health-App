
import {
  estilosDoTema,
  listGap,
  radius,
  screenPadding,
  spacing,
  superficieDeCartao,
  typography,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.gutter,
  },

  aviso: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
  },
  avisoTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  secaoNota: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rotulo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    flexShrink: 1,
  },
  valor: {
    ...typography.bodyMd,
    color: cores.onSurface,
    fontWeight: "600",
  },
  valorOk: {
    color: cores.success,
  },
  valorRuim: {
    color: cores.error,
  },

  agendado: {
    gap: 2,
    paddingVertical: spacing.sm,
  },
  agendadoComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  agendadoQuando: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  agendadoTitulo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  agendadoId: {
    ...typography.caption,
    textTransform: "none",
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  selo: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.primaryContainer,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onPrimaryContainer,
  },

  vazio: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingVertical: spacing.md,
    textAlign: "center",
  },

  acoes: {
    gap: spacing.sm,
  },
}));
