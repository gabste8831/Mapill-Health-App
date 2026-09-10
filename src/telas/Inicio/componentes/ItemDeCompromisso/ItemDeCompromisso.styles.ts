import { estilosDoTema, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: cores.surfaceContainerLowest,
    boxShadow: surfaceShadow,
  },
  icone: {
    width: 64,
    alignItems: "flex-start",
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.headlineSm,
    fontSize: 16,
    color: cores.onSurface,
  },
  detalhe: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  selo: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.successSurface,
  },
  seloAusente: {
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSuccessContainer,
  },
  seloTextoAusente: {
    color: cores.onErrorSurface,
  },
}));
