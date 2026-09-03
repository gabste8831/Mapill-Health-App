
import { estilosDoTema, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Pílula, e não o retângulo dos campos de formulário: a forma arredondada é o que sinaliza
   * "busca" antes de qualquer rótulo — é a mesma do widget de busca que a pessoa já usa todo dia
   * na tela inicial do celular. Buscar também é diferente de preencher: nada aqui vai ser salvo,
   * e o campo não deve parecer que cobra uma resposta.
   *
   * Sombra, e não borda — mesma regra do resto do app (decisão de 21/08). A pílula já tem a forma
   * de campo de busca sem precisar de contorno pra provar isso, e a borda de 2px carregada estava
   * deixando o campo "pesado" perto do resto da tela, que não usa contorno em nenhum outro lugar.
   */
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    // `minHeight`, e não `height`: com altura travada o texto da busca é recortado quando a fonte
    // do sistema está ampliada.
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    boxShadow: surfaceShadow,
    backgroundColor: cores.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    // Sem altura própria: o container manda, e o texto fica centrado nele.
    padding: 0,
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /** Alvo de toque confortável sem esticar a pílula — o recuo compensa o padding do container. */
  clearButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
}));
