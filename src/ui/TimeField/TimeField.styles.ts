
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

/** O mesmo lado do botão do `DateField`: os dois campos aparecem um sob o outro e têm que casar. */
const LADO_DO_BOTAO = 52;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
  /** A coluna tem a largura do botão, senão o rótulo fantasma dentro dela mediria o texto inteiro. */
  colunaDoBotao: {
    width: LADO_DO_BOTAO,
  },
  /**
   * O rótulo repetido **invisível** acima do botão, para empurrá-lo até a altura do input.
   *
   * Era um `marginTop: 22` cravado, medido para a altura de um rótulo de 12px — e o `DateField`
   * já tinha abandonado essa conta justamente porque ela só acerta no caso para o qual foi feita.
   * O comentário aqui dizia "mesma medida do `DateField`", e havia deixado de ser verdade: o
   * rótulo passou a 13px, e os 22 desalinhavam o botão do relógio do campo ao lado.
   *
   * Com o próprio rótulo ocupando o espaço, a conta deixa de existir: ele mede o que precisa
   * medir, com rótulo de duas linhas ou com a fonte do sistema ampliada.
   */
  rotuloFantasma: {
    ...typography.label,
    marginBottom: fieldLabelGap,
    opacity: 0,
  },
  botaoDeRelogio: {
    width: LADO_DO_BOTAO,
    height: LADO_DO_BOTAO,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    backgroundColor: cores.surfaceContainerLowest,
  },
  sheetBody: {
    gap: spacing.md,
  },
  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },
}));
