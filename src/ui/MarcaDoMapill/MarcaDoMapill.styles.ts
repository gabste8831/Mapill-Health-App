import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  raiz: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  wordmark: {
    ...typography.brandWordmark,
    fontSize: 22,
    lineHeight: 26,
    /**
     * A cor vem do tema (`onSurface`), e não mais de um pixel congelado num PNG. É exatamente
     * isto que resolve o desaparecimento no tema escuro: a mesma regra de qualquer texto do app.
     */
    color: cores.onSurface,
  },
}));
