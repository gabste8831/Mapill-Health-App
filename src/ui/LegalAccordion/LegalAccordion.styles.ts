
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    paddingBottom: spacing.sm,
  },
  /**
   * Justificado só aqui, e não como padrão do app: é o alinhamento de documento legal, e o texto
   * corrido e longo dos termos é o único lugar onde a coluna é densa o bastante pra ele ajudar em
   * vez de abrir rios de espaço entre as palavras.
   */
  paragraph: {
    ...typography.bodyMd,
    color: cores.onSurface,
    textAlign: "justify",
  },
}));
