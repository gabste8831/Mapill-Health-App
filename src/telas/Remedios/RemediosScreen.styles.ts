
import { bottomTabInset, estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /**
   * O bloco fixo do topo: só a busca e o seletor de ordem, que são controles que se opera.
   *
   * O `paddingBottom` voltou quando a contagem saiu daqui — era a margem dela que separava este
   * bloco da lista, e sem nada no lugar o seletor de ordem encostava no primeiro card.
   */
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    /**
     * `md` dentro do bloco, `lg` abaixo dele.
     *
     * O `gap` separa a busca do seletor — dois controles do mesmo assunto, e antes eles ficavam
     * grudados porque só a busca tinha margem, e para cima. O `paddingBottom` maior separa o bloco
     * inteiro do conteúdo, que é troca de escopo: acima o que se opera, abaixo o que se lê.
     */
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  /**
   * A contagem, encostada na lista que ela descreve.
   *
   * Sem margem própria: ela é o último filho do `listHeader`, e o espaço acima vem do `gap` dele
   * (o mesmo que a separa do atalho de estoque). Abaixo, o `gap` do `listContent` a separa do
   * primeiro card — o mesmo respiro que há entre dois cards, então ela fica na malha da lista em
   * vez de flutuar.
   *
   * Ela **saiu** do bloco fixo do topo, onde vivia junto da busca: ali parecia legenda dos
   * controles, não da lista.
   */
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  /**
   * O que rola junto com a lista: o atalho do estoque e, embaixo dele, a contagem.
   *
   * `lg` entre os dois porque são assuntos diferentes — um leva a outra tela, a outra descreve o
   * que vem a seguir. Sem `paddingBottom`: o espaço até o primeiro card já vem do `gap` do
   * `listContent`, o mesmo que há entre dois cards, então a contagem fica na malha da lista em vez
   * de flutuar acima dela.
   */
  listHeader: {
    gap: spacing.lg,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    /**
     * Sem `paddingTop`: quem dá o respiro entre o bloco fixo e o atalho de estoque é o
     * `paddingBottom` do `header`.
     *
     * Com os dois, o espaço ali somava 24 enquanto o da busca para o seletor era 16 — dois vãos
     * diferentes numa sequência que se lê como uma pilha só de controles. Agora os três degraus do
     * topo (busca → filtros → estoque) medem o mesmo `md`.
     */
    gap: listGap,
    paddingBottom: bottomTabInset + spacing.xxl,
  },

  // --- Item da lista ---
  /**
   * O cartão do kit, sem borda. A borda cinza que estava aqui era o que dava à lista o aspecto de
   * planilha: com o fundo da tela quase da mesma cor do cartão, o contorno de 1px lê como célula
   * desenhada, e não como superfície acima. `superficieDeCartao` traz junto o respiro maior.
   */
  /**
   * O cartão do kit com o respiro apertado: `md` (16) no lugar do `gutter` (24) do token.
   *
   * Os 24 do `superficieDeCartao` são para o cartão que se lê inteiro — um bloco de conteúdo na
   * Home, o resumo da adesão. Numa lista, o mesmo respiro se repete a cada item e o custo aparece
   * somado: são 16px a mais de altura por remédio, que em cinco cadastros já valem um card inteiro
   * fora da tela.
   */
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * A foto cresceu de 40 para 52 e ganhou canto mais redondo. Num cartão com mais respiro, a
   * miniatura pequena ficava perdida no canto — e ela é o que faz reconhecer o remédio de relance,
   * que é a razão de ela existir.
   */
  photo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainer,
  },
  /** O lugar da foto quando não há foto: azul claro com o ícone, em vez de um vazio. */
  photoVazia: {
    backgroundColor: cores.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  itemHeaderText: {
    flex: 1,
    gap: 2,
  },
  /** Editar e excluir dividindo a largura ao meio, abaixo de todo o resto do cartão. */
  acoes: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing.sm,
  },
  acaoBotao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // Alvo de toque de sobra: são as duas ações mais tocadas do cartão depois de "ver detalhe".
    minHeight: 40,
  },
  /**
   * A linha vertical entre as duas metades — bem discreta de propósito: ela só separa, não
   * precisa se notar sozinha. `outlineVariant` já é a cor mais clara de contorno do tema, e ainda
   * assim entra a 50% — o traço na cor cheia competia com o texto das duas ações ao lado.
   */
  acaoDivisor: {
    width: 1,
    backgroundColor: cores.outlineVariant,
    opacity: 0.5,
  },
  acaoTexto: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  acaoTextoDestrutivo: {
    color: cores.error,
  },

  // --- Popup de detalhe ---
  detalheBloco: {
    gap: spacing.md,
  },
  detalheLinha: {
    gap: 2,
  },
  detalheRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  detalheValor: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  name: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  activeIngredient: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * Linha "Todo dia · 08:00, 14:00, 20:00", no lugar onde antes ficava o princípio ativo — quando
   * tomar, não quanto (isso fica no popup) nem o que é (a substância, que já está lá também).
   */
  posology: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * Sem a linha divisória. Dentro de um cartão que já tem respiro, o traço cinza é ruído: o espaço
   * separa melhor do que o risco — mesma razão pela qual as bordas saíram dos cartões.
   *
   * Só o estoque mora aqui. O `space-between` que existia empurrava o local de guarda para a
   * direita, e saiu junto com ele: com um filho só, ele não teria efeito nenhum além de confundir
   * quem for mexer nesta linha depois.
   */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  stock: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  stockLow: {
    color: cores.error,
  },

  // --- Estados ---
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
