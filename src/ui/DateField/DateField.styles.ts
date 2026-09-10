
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

/** 52 é a altura mínima do `TextField`: o botão sai quadrado e alinhado com o campo ao lado. */
const LADO_DO_BOTAO = 52;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    // Sem isto, um filho `row` encolhe até o conteúdo quando o pai não tem `alignItems: "stretch"`.
    alignSelf: "stretch",
  },
  campo: {
    flex: 1,
  },
  /**
   * Largura fixa porque senão a coluna mede o `rotuloFantasma` inteiro e deixa uma faixa vazia do
   * tamanho do texto do rótulo. Depende do `numberOfLines={1}` no fantasma.
   */
  colunaDoBotao: {
    width: LADO_DO_BOTAO,
  },
  /**
   * O rótulo repetido invisível empurra o botão até a altura do input. Precisa da mesma tipografia
   * e do mesmo `gap` do `TextField`, senão desalinha com rótulo de duas linhas ou fonte ampliada.
   * Fica `aria-hidden`: o leitor de tela já anunciou o rótulo uma vez.
   */
  rotuloFantasma: {
    ...typography.label,
    marginBottom: fieldLabelGap,
    opacity: 0,
  },
  botaoDeCalendario: {
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
