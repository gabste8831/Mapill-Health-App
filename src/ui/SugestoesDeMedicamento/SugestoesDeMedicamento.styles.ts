
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Gruda no campo, e não flutua como um bloco à parte: mesma borda do `TextField` (cor e
   * largura), cantos de cima retos — continuam a linha do campo acima — e só os de baixo
   * arredondados, fechando a lista. `marginTop` negativo funde as duas bordas horizontais numa
   * só, em vez de duas linhas coladas uma na outra.
   */
  container: {
    backgroundColor: cores.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderTopWidth: 0,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    marginTop: -1,
    overflow: "hidden",
  },
  titulo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: cores.outlineVariant,
    // Alvo confortável: a lista aparece sob o dedo de quem está digitando, e um item raso é toque
    // errado — que aqui significa cadastrar o remédio errado.
    minHeight: 52,
  },
  nome: {
    ...typography.bodyLg,
    color: cores.onSurface,
    flex: 1,
  },
  /** A dosagem no mesmo peso do nome: "Tylenol 500" e "Tylenol 750" só diferem por ela. */
  dosagem: {
    color: cores.corDeDestaque,
  },
}));
