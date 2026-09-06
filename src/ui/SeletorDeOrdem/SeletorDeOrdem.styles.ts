
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
   * `caption` (10px) e não `label` (12px).
   *
   * É o degrau de fonte que, junto com a saída do ícone, faz "Mais recentes" caber numa ficha de um
   * terço da tela. Continua legível: são duas ou três palavras curtas em maiúsculas, com o estado
   * também marcado pelo preenchimento da ficha — a leitura não depende só de ler a palavra.
   */
  rotulo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  rotuloSelecionado: {
    color: cores.onPrimary,
  },
}));
