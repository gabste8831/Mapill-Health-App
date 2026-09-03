
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Fundo âmbar diluído e o ícone na tinta cheia — **sem faixa lateral**.
   *
   * A faixa de 4px saiu do app inteiro: ela empurra o conteúdo para a direita, desalinhando uma
   * dica do campo logo acima dela, e quem não repara na borda não recebe o aviso. Aqui o ícone
   * "?" já fazia o trabalho de dizer "isto é apoio"; ele só precisava de uma cor que se enxergue.
   *
   * O padding subiu de `sm` (8) para `md` (16): com 8 o texto encostava na borda do bloco e a
   * dica lia como um erro de layout em vez de um aviso desenhado.
   */
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.warningSurface,
  },
  /** Alinha o ícone com a primeira linha do texto, e não com o centro do bloco inteiro. */
  icone: {
    marginTop: 1,
  },
  texto: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },
}));
