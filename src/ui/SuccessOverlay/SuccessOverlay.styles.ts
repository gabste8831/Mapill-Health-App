
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Cobre a tela inteira, inclusive a barra de abas: a confirmação é o único assunto do momento,
   * e deixar a navegação à mostra convidaria a tocar em algo no meio da animação.
   */
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: cores.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.gutter,
    padding: spacing.lg,
  },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: cores.onPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: {
    gap: spacing.sm,
    alignItems: "center",
  },
  title: {
    ...typography.headlineMd,
    color: cores.onPrimary,
    textAlign: "center",
  },
  description: {
    ...typography.bodyLg,
    color: cores.onPrimary,
    opacity: 0.9,
    textAlign: "center",
    maxWidth: 320,
  },
}));
