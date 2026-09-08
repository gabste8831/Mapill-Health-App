
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

/**
 * O lado do botão de calendário — que é também a largura da coluna que o contém.
 *
 * Os dois precisam do mesmo número: a coluna existe só para segurar o botão, e se ela medir
 * diferente sobra (ou falta) espaço entre o input e a borda. 52 é a altura mínima do `TextField`,
 * então o botão sai quadrado e alinhado com o campo ao lado.
 */
const LADO_DO_BOTAO = 52;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    /**
     * `alignSelf: "stretch"` para o campo ocupar a **linha inteira**.
     *
     * Sem isto, um filho `row` dentro de uma coluna encolhe até o conteúdo em vez de esticar — e o
     * campo aparecia estreito, com sobra à direita, diferente dos outros do mesmo formulário. Só
     * se notava onde o pai não tinha `alignItems: "stretch"` próprio, que é o caso da seção de
     * anexos do cadastro de medicamento ("RECEITA VÁLIDA ATÉ").
     *
     * Vale para todo `DateField`: em nenhum lugar o campo de data deve medir menos que a coluna
     * onde está. O `flex: 1` de `campo` reparte a largura entre o input e o botão de calendário
     * **depois** que a linha já tem a sua.
     */
    alignSelf: "stretch",
  },
  campo: {
    flex: 1,
  },
  /**
   * A coluna do botão tem a largura **do botão**, e não a do rótulo invisível que mora nela.
   *
   * `rotuloFantasma` repete o texto do rótulo com `opacity: 0` para empurrar o botão até a altura
   * do input (ver abaixo). Sem largura declarada aqui, essa coluna media o **texto inteiro** —
   * "RECEITA VÁLIDA ATÉ" deixava uma faixa vazia do tamanho da frase entre o input e a borda do
   * card, e o campo parecia estreito sem que nada nele estivesse estreito.
   *
   * `width` fixo e não `alignItems`: o fantasma precisa continuar podendo ocupar a coluna toda
   * para medir a altura certa, então quem limita é a coluna, não o alinhamento do filho. O
   * `numberOfLines={1}` no fantasma completa a dupla — um rótulo longo espremido em 52px
   * quebraria em várias linhas e empurraria o botão para baixo do input.
   */
  colunaDoBotao: {
    width: LADO_DO_BOTAO,
  },
  /**
   * O rótulo do campo, repetido **invisível** acima do botão para empurrá-lo até a altura do input.
   *
   * Já foi um `marginTop: 22` cravado, calculado para a altura de um rótulo — e por isso só
   * funcionava onde havia um. Em "QUANDO COMEÇA", que rotula a seção por fora e passa `label=""`
   * ao campo, os 22px empurravam o botão para baixo do input, visivelmente fora de centro.
   *
   * Aqui o espaço é o **próprio rótulo**, com a mesma tipografia e o mesmo `gap` do `TextField`.
   * Ele mede o que precisa medir em vez de adivinhar: rótulo de duas linhas, fonte ampliada pelo
   * sistema, campo sem rótulo nenhum — nos três o botão acompanha o input, porque é a mesma caixa
   * que o empurra nos dois lados. `aria-hidden` porque para quem usa leitor de tela o rótulo já foi
   * anunciado uma vez, e o botão tem o seu próprio.
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
