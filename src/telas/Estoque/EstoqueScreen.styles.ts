
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /** Sem `paddingBottom`: o respiro abaixo vem da contagem, como na lista de medicações. */
  header: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
  },
  busca: {
    marginTop: spacing.md,
  },
  /** O mesmo respiro (`md` acima, `sm` abaixo) da contagem em Medicações e em Compromissos. */
  contagem: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: spacing.xxl,
  },

  // --- Cartão de um estoque ---
  /** Mesmo cartão da lista de medicações: sombra, sem borda, respiro de `gutter`. */
  item: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  local: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  /** O rótulo que nomeia o dado ao lado — mais fraco que ele, porque o dado é a informação. */
  rotulo: {
    color: cores.onSurfaceVariant,
  },
  /**
   * As duas respostas da tela — quanto resta e até quando dá — num bloco só, com fundo próprio.
   *
   * Soltas no cartão elas liam com o mesmo peso do nome e do local, e a tela existe justamente para
   * comparar números entre medicações. O fundo é o que faz o olho pular de um card para o outro
   * lendo só o que importa.
   */
  /**
   * Separa quem é o remédio do que se sabe sobre o estoque dele.
   *
   * Sem margem própria: o `gap` do cartão já dá o respiro dos dois lados, e somar margem a ele
   * abriria o dobro do espaço em volta de um traço de 1px.
   */
  divisor: {
    height: 1,
    backgroundColor: cores.outlineVariant,
  },
  /** Local e estoque, um sob o outro e com o mesmo peso: são dados do mesmo tipo. */
  dados: {
    gap: 2,
  },
  quantidade: {
    ...typography.bodyMd,
    color: cores.onSurface,
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
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /**
   * A etiqueta dos dois estados que pedem atenção — âmbar e vermelho compartilham a forma, e só a
   * cor muda.
   *
   * `flex-start` para encolher até o texto: é uma etiqueta, não uma faixa que atravessa o cartão. O
   * recuo negativo devolve o alinhamento com as linhas de cima, que não têm padding lateral.
   */
  previsaoEtiqueta: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    marginLeft: -spacing.sm,
  },
  /**
   * Entrou na janela de reposição. Âmbar diluído, a mesma linguagem da `Dica` e do lembrete de
   * conferência logo acima — porque é a mesma natureza: apoio, não cobrança.
   *
   * O fundo (e não só a cor do texto) é o que faz este estado se ver ao rolar a lista, que é como
   * se usa esta tela: procurando o que precisa de atenção entre os que não precisam.
   */
  previsaoEmAlerta: {
    color: cores.onWarningSurface,
    backgroundColor: cores.warningSurface,
  },
  previsaoCritica: {
    color: cores.onErrorContainer,
    backgroundColor: cores.errorSurface,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  acao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // Mesmo piso de alvo de toque usado no calendário: abaixo de 44 a linha vira armadilha.
    minHeight: 44,
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
    marginBottom: spacing.md,
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
