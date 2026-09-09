
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fileira: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  /**
   * Cada ficha ocupa a mesma fração da largura.
   *
   * `flex: 1` em vez de largura pelo conteúdo: assim as três (ou quatro) cabem sem rolagem, e a
   * fileira fica alinhada em vez de ter "A–Z" minúsculo ao lado de "Mais recentes" comprido.
   */
  ficha: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    // 40 de altura: menor que o alvo de 44 dos botões de ação, porque errar aqui só reordena a
    // lista — é reversível num toque, diferente de confirmar uma dose.
    height: 40,
    borderRadius: radius.full,
    /**
     * `surfaceContainer` e não `surfaceContainerLow`.
     *
     * O `Low` (#F5F7FA) fica a um passo do fundo da tela (#F1F4F8) — as fichas não selecionadas
     * praticamente sumiam, e a fileira lia como um botão só flutuando no vazio. As opções que **não**
     * estão marcadas precisam ser vistas: são elas que dizem que há escolha ali.
     */
    backgroundColor: cores.surfaceContainer,
  },
  fichaSelecionada: {
    backgroundColor: cores.primary,
  },
  /**
   * `label` (12px), em caixa de frase.
   *
   * Já foi `caption` (10px), e o degrau a menos existia para "Mais recentes" caber numa ficha de um
   * terço da tela — o `caption` sobe a caixa, e maiúscula é mais larga. Em caixa de frase a mesma
   * palavra ocupa menos, então cabe com o tamanho maior: o que era um empréstimo do token de selo
   * volta a ser rótulo, que é o que estas fichas têm.
   *
   * Ficha de filtro não é selo. O selo se reconhece de relance sem ser lido ("ATRASADA"); estas
   * aqui são escolhas que a pessoa compara antes de tocar, e comparar é leitura.
   */
  rotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  rotuloSelecionado: {
    color: cores.onPrimary,
  },
}));
