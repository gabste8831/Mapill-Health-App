
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Um bloco cinza logo abaixo do campo, sem contorno.
   *
   * As bordas (a do bloco e a de cada item) desenhavam uma grade de caixas — a gramática de
   * formulário HTML que o resto do app já abandonou, e que aqui pesava ainda mais por serem cinco
   * ou seis linhas contornadas sob o campo que estava sendo digitado. A superfície levemente mais
   * escura separa a lista do fundo com um gesto só, e o `gap` separa os itens entre si.
   */
  container: {
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: radius.md,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  titulo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingBottom: 2,
  },
  /**
   * Mais raso que antes (52 → 40): com quatro sugestões, a lista inteira agora ocupa menos altura
   * que três itens ocupavam, e o campo que está sendo digitado continua à vista sobre o teclado.
   *
   * O alvo de dedo não some junto — `hitSlop` no componente devolve a folga que a caixa perdeu, e
   * tocar a linha errada aqui significa cadastrar o remédio errado.
   */
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 40,
  },
  nome: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },
  /** A dosagem no mesmo peso do nome: "Tylenol 500" e "Tylenol 750" só diferem por ela. */
  dosagem: {
    color: cores.corDeDestaque,
  },
}));
