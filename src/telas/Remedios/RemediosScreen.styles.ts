
import { bottomTabInset, estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /**
   * Sem `paddingBottom`: ele existia para afastar a contagem do que vem abaixo, mas o
   * `marginBottom` dela já faz isso, e os dois somavam.
   */
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
  },
  busca: {
    marginTop: spacing.md,
  },
  /**
   * O mesmo respiro (`md` acima, `sm` abaixo) que separa a contagem do resto em Compromissos.
   *
   * Era `gutter` (24) em cima e `md` (16) embaixo, e o de baixo somava com o `paddingBottom` do
   * `header` e com o `paddingTop` do `listHeader` logo abaixo — três espaços empilhados, 48px até o
   * primeiro card ou o botão de estoque, contra 8px em Compromissos. A diferença nasce de as duas
   * telas montarem isto de formas diferentes: lá a contagem rola junto com a lista e não tem margem
   * própria; aqui ela mora no bloco fixo do topo, junto da busca, e precisa das suas.
   */
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  /**
   * O acesso ao estoque, que rola junto com a lista.
   *
   * Sem padding próprio: o respiro acima já vem do `marginBottom` da contagem, e o de baixo do
   * `gap` do `listContent` — que é o mesmo espaço entre dois cards, então o botão fica na malha da
   * lista em vez de flutuar. Quando não há estoque cadastrado este bloco fica vazio, e sem padding
   * ele também não ocupa altura nenhuma.
   */
  listHeader: {
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: bottomTabInset + spacing.xxl,
  },

  // --- Item da lista ---
  /**
   * O cartão do kit, sem borda. A borda cinza que estava aqui era o que dava à lista o aspecto de
   * planilha: com o fundo da tela quase da mesma cor do cartão, o contorno de 1px lê como célula
   * desenhada, e não como superfície acima. `superficieDeCartao` traz junto o respiro maior.
   */
  item: {
    ...superficieDeCartao(cores, ajustes),
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
