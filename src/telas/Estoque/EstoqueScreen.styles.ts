
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /**
   * O bloco fixo do topo: busca e seletor de ordem, os controles que se opera.
   *
   * `gap` e `paddingBottom` iguais (`md`), como na lista de medicações: os degraus do topo — busca
   * → filtros → conteúdo — medem todos o mesmo, e a sequência lê como uma pilha só.
   */
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    /**
     * O respiro embaixo é **maior** que o de dentro do bloco.
     *
     * `md` separa a busca do seletor: são dois controles, do mesmo assunto. `lg` separa o bloco
     * inteiro do conteúdo que vem depois, que é uma troca de escopo — o que se opera acima, o que
     * se lê abaixo. Com os dois iguais, a fronteira entre as duas coisas sumia.
     */
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  /**
   * O que rola junto com a lista: o lembrete de recontagem e, embaixo, a contagem.
   *
   * `lg` entre os dois porque são assuntos diferentes — um pede uma ação, a outra descreve o que
   * vem a seguir.
   */
  listHeader: {
    gap: spacing.lg,
  },
  /**
   * A contagem, encostada na lista que ela descreve.
   *
   * Sem margem própria: o espaço acima vem do `gap` do `listHeader`, e o de baixo do `gap` do
   * `listContent` — o mesmo que há entre dois cards, então ela fica na malha da lista.
   */
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    // Sem `paddingTop`: quem separa o bloco fixo do conteúdo é o `paddingBottom` do `header`. Com
    // os dois, aquele degrau ficava maior que o da busca para os filtros.
    gap: listGap,
    paddingBottom: spacing.xxl,
  },

  // --- Cartão de um estoque ---
  /** Mesmo cartão da lista de medicações, e o mesmo respiro apertado (`md`, não o `gutter`). */
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },
  /**
   * Nome à esquerda, quantidade à direita, na mesma linha.
   *
   * As duas perguntas do cartão — de que remédio é, quanto resta — lado a lado, para a lista ser
   * varrida por uma coluna de números. `baseline` alinha as duas pelo pé da letra, e não pelo meio
   * da caixa: o nome é maior, e centrado ele deixava o número parecendo deslocado para cima.
   */
  /**
   * Nome e quantidade empilhados, com respiro entre eles.
   *
   * `md` e não `xs`: colados, os dois liam como uma linha só que quebrou — e a diferença de peso
   * sozinha não separava o nome do dado. O nome é o título do cartão, e título pede respiro abaixo.
   */
  identificacao: {
    gap: spacing.md,
  },
  /**
   * O nome, com peso de título — mas sem virar manchete.
   *
   * `headlineSmRegular` e não `headlineSm`: o semibold em corpo 18 pesava mais que o nome de tela e
   * dominava o cartão. O que separa o nome da quantidade abaixo é o tamanho e a cor; o negrito era
   * um terceiro sinal para a mesma distinção, e sobrava.
   */
  name: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  /**
   * A quantidade, com o peso de dado e não de rótulo.
   *
   * Ela perdeu o prefixo "Estoque:" ao subir para a linha do nome — o número à direita, alinhado
   * com os dos outros cartões, já diz o que é. É o que faz a lista ser lida como uma coluna.
   */
  quantidade: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** Acabou ou acaba hoje. Sem fundo: o vermelho no texto basta agora que o bloco não é colorido. */
  quantidadeCritica: {
    color: cores.error,
  },
  /**
   * O prazo, fora da faixa e em texto de apoio.
   *
   * É uma projeção, não uma contagem: dar a ela o mesmo destaque do número faria uma estimativa
   * parecer um fato conferido — e é justamente por isso que existe o lembrete de recontagem.
   */
  /**
   * O prazo, em três estados.
   *
   * Neutro é texto puro, sem fundo nem padding: a maioria dos remédios está longe de acabar, e
   * pintar todos eles gastaria o destaque justamente onde ele não serve para nada.
   */
  previsao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  previsaoTextoEmAlerta: {
    color: cores.onWarningSurface,
  },
  previsaoTextoCritico: {
    // `error`, e não `onErrorContainer`: este texto fica sobre superfície clara, e o token de
    // container é quase preto (9.9:1) num matiz diferente — dava um vermelho que não combinava com
    // o resto do app.
    color: cores.error,
  },
  /**
   * O selo do prazo, com ícone. Existe nos **três** estados, e não só nos de aviso.
   *
   * Com o fundo aparecendo apenas quando há problema, o cartão mudava de anatomia conforme o
   * estoque e a lista ficava com uma coluna irregular. Mantendo a forma sempre, o que se lê ao
   * varrer a tela é a **cor** — que é justamente o dado.
   *
   * `flex-start` para encolher até o conteúdo: é um selo, não uma faixa que atravessa o cartão.
   */
  previsaoEtiqueta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    backgroundColor: cores.surfaceContainerLow,
  },
  /**
   * Entrou na janela de reposição. Âmbar diluído, a mesma linguagem da `Dica` e do lembrete de
   * conferência logo acima — porque é a mesma natureza: apoio, não cobrança.
   */
  previsaoEmAlerta: {
    backgroundColor: cores.warningSurface,
  },
  previsaoCritica: {
    backgroundColor: cores.errorSurface,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  /**
   * 36 de altura, e não 44.
   *
   * Os 44 são o piso para o que **precisa** ser acertado de primeira. Aqui errar abre um popup que
   * se fecha — e os dois botões ocupavam, juntos, mais altura que o resto do cartão. O alvo real
   * continua confortável: eles dividem a largura inteira, então o dedo tem meia tela para acertar.
   */
  acao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 36,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  /**
   * "Repor" ganha superfície azul clara — antes ele era idêntico a "Recontar" e mudava só a cor do
   * texto, ou seja, um botão primário disfarçado de secundário.
   *
   * As duas ações não têm o mesmo peso: recontar é conferência ocasional, repor é o que a pessoa
   * veio fazer quando abriu esta tela porque o remédio está acabando. A cor diz qual é qual antes
   * de o rótulo ser lido.
   */
  /**
   * Azul cheio: "Repor" é a ação que se vem fazer aqui — voltou da farmácia e quer somar o que
   * chegou. "Recontar" é conferência, e fica ao lado como alternativa, não como igual.
   *
   * O azul saiu do dado (a quantidade tinha fundo azul) e veio para a ação: num cartão que é todo
   * informação, o que deve puxar o olho é o que se pode fazer com ela.
   */
  acaoPrimaria: {
    backgroundColor: cores.primaryContainer,
  },
  acaoTexto: {
    ...typography.label,
    color: cores.onSurface,
  },
  acaoTextoPrimaria: {
    color: cores.onPrimaryContainer,
  },

  /**
   * O ajuste do aviso, abaixo das duas ações.
   *
   * Discreta de propósito: é configuração, e compete com "Repor" e "Recontar", que são o que se vem
   * fazer aqui. Alvo de 44 mesmo sendo texto pequeno — a regra vale para o que é tocável, não para
   * o que é chamativo.
   */
  linhaDeAviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: radius.md,
  },
  linhaDeAvisoTexto: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
    // Empurra a seta para a direita e deixa o texto cortar antes dela, não em cima.
    flex: 1,
  },

  // --- Rodapé: o caminho pra quem não achou um remédio aqui ---
  /**
   * Só o botão de voltar às medicações.
   *
   * Era uma caixa com fundo, título e parágrafo explicando onde se liga o controle de estoque —
   * peso de bloco de conteúdo para o que é apenas uma saída. Sem o texto, o fundo e o padding não
   * têm o que conter: sobra a margem que separa o botão do último card.
   */
  rodape: {
    marginTop: spacing.md,
  },

  /**
   * O lembrete de conferência. Âmbar diluído, a mesma linguagem da `Dica` — porque é
   * exatamente isso: apoio, não cobrança. O plano registra a recontagem como **não obrigatória**
   * (decisão nº6), e o app funciona igual se ninguém nunca conferir.
   */
  lembrete: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    // Sem `marginBottom`: o respiro até a contagem vem do `gap` do `listHeader`, e os dois somavam.
  },
  lembreteTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  lembreteTitulo: {
    ...typography.label,
    color: cores.onWarningSurface,
  },
  lembreteTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },

  // --- Popup de recontagem / reposição ---
  sheetBody: {
    gap: spacing.md,
  },
  sheetMedicamento: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  /**
   * A antecedência escolhida não cabe no estoque de hoje. Âmbar, e não vermelho: o que a pessoa
   * escolheu é válido — só não vai produzir o efeito que ela espera.
   */
  sheetConflito: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    backgroundColor: cores.warningSurface,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  sheetAtual: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  sheetPrevia: {
    ...typography.bodyMd,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },

  // --- Estados ---
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
