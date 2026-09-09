
import { estilosDoTema, fronteiraDeSuperficie, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * Pílula, e não o retângulo dos campos de formulário: a forma arredondada é o que sinaliza
   * "busca" antes de qualquer rótulo — é a mesma do widget de busca que a pessoa já usa todo dia
   * na tela inicial do celular. Buscar também é diferente de preencher: nada aqui vai ser salvo,
   * e o campo não deve parecer que cobra uma resposta.
   *
   * Sombra, e não borda — mesma regra do resto do app (decisão de 21/08). A pílula já tem a forma
   * de campo de busca sem precisar de contorno pra provar isso, e a borda de 2px carregada estava
   * deixando o campo "pesado" perto do resto da tela, que não usa contorno em nenhum outro lugar.
   *
   * **No alto contraste vale o contrário**, e por isso a fronteira vem do tema. Ali a sombra não
   * se vê: a pílula branca sobre o fundo branco perdia toda a fronteira, e o que sobrava era um
   * ícone de lupa solto no topo da tela.
   *
   * Aqui a borda é a **leve** (1px), e não a de 2px dos botões. O fundo um degrau mais escuro já
   * separa o campo do fundo da tela antes de a borda entrar — as duas ênfases somadas engordavam
   * a pílula a ponto de ela pesar mais que o conteúdo que ajuda a filtrar. Botão é para ser
   * encontrado; busca é para estar disponível.
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
    ...fronteiraDeSuperficie(cores, ajustes),
    backgroundColor: ajustes.contornarSuperficies
      ? cores.surfaceContainerLow
      : cores.surfaceContainerLowest,
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
