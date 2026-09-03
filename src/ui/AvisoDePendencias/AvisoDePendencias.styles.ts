
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Discreto de propósito: fundo neutro, ícone pequeno, texto de apoio. Ele informa, não alerta —
   * e um aviso que compete com o conteúdo da lista seria lido uma vez e ignorado nas seguintes.
   */
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  texto: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
    flex: 1,
  },
}));
