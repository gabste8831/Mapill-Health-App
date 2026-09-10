
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  preview: {
    flex: 1,
  },
  alvo: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "35%",
    height: "20%",
    borderWidth: 2,
    borderColor: cores.onPrimary,
    borderRadius: radius.md,
  },
  instrucao: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.xl,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  instrucaoTexto: {
    ...typography.bodyLg,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    textAlign: "center",
    overflow: "hidden",
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  rotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  titulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  nome: {
    ...typography.headlineMd,
    color: cores.onSurface,
  },
  texto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  ean: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    backgroundColor: cores.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.sm,
    textAlign: "center",
    letterSpacing: 1,
  },
}));
