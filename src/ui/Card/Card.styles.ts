
import { estilosDoTema, fronteiraDeSuperficie, radius, spacing } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * Sombra em vez de borda: o fundo da tela e o card são quase da mesma cor, então a borda de
   * 1px fazia o card parecer uma caixa desenhada e não uma superfície acima. A sombra é
   * discreta de propósito - o objetivo é separar do fundo, não empilhar camadas.
   *
   * O valor vive em `surfaceShadow`: a copia dele em cinco arquivos era o que deixava as telas
   * divergirem.
   */
  card: {
    backgroundColor: cores.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.gutter,
    // No alto contraste vira contorno: ali a sombra e invisivel, e este `Card` era o unico que
    // ficava de fora - o `superficieDeCartao` ja trocava, mas quem usa o componente do kit nao
    // passava por ele.
    ...fronteiraDeSuperficie(cores, ajustes),
  },
}));
