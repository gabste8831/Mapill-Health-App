
import { estilosDoTema, spacing, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Sombra para cima, e **não** a borda de 1px que havia aqui.
   *
   * A regra do app é "sombra, e nunca borda" (ver `elevation.ts`), e este era um dos poucos lugares
   * que ainda contornava: `borderTopWidth: 1` sobre `outlineVariant`. O efeito era o mesmo das
   * listas que pareciam planilha — uma linha cinza dividindo dois brancos quase iguais.
   *
   * A sombra é a certa aqui porque o rodapé **está de fato acima do conteúdo**: a lista rola por
   * baixo dele, e é isso que ele precisa comunicar.
   *
   * O deslocamento é **negativo** — a sombra sobe. Os tokens de `elevation.ts` projetam para baixo,
   * que é o certo para um cartão sobre o fundo; num rodapé, uma sombra para baixo cairia fora da
   * tela e não apareceria.
   */
  rodape: {
    backgroundColor: cores.background,
    boxShadow: `0px -2px 8px ${withOpacity(cores.onSurface, 0.08)}`,
  },
  conteudo: {
    padding: spacing.md,
    gap: spacing.sm,
  },
}));
