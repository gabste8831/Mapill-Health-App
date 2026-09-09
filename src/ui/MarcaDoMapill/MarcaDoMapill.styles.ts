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
    // A Comfortaa desce 1.26x o corpo como a Jakarta: com 26 o "p" de "Mapill" encostava no corte.
    lineHeight: 28,
    /**
     * O `letterSpacing` do token é absoluto (em pixels), e não proporcional ao corpo — então ele
     * precisa acompanhar a redução de 32 para 22. Herdado sem ajuste, o mesmo -1 fecharia as letras
     * bem mais do que no tamanho para o qual foi escolhido.
     */
    letterSpacing: -0.7,
    /**
     * A cor vem do tema (`onSurface`), e não mais de um pixel congelado num PNG. É exatamente
     * isto que resolve o desaparecimento no tema escuro: a mesma regra de qualquer texto do app.
     */
    color: cores.onSurface,
  },
}));
