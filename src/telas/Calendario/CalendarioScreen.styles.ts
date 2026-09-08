
import { bottomTabInset, estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /**
   * A grade dentro do scroll precisa desfazer o `paddingHorizontal` dele: a faixa azul vai de borda
   * a borda, e recuada deixaria o fundo aparecendo dos dois lados. O `paddingTop` do scroll também
   * é anulado — a faixa encosta no cabeçalho, como quando ela era fixa.
   */
  gradeNoScroll: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.sm,
  },

  /**
   * Entre a grade e a lista: o filtro governa as duas, então fica entre elas — e é o único que
   * gruda no topo quando a página rola. Fundo opaco e não transparente por causa disso: grudado
   * sem fundo, a lista passaria por baixo dele.
   */
  filtros: {
    // Sangra até as bordas e devolve o recuo por dentro: grudado, o fundo precisa cobrir a largura
    // inteira, senão a lista aparece passando pelas laterais.
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: cores.background,
  },
  /**
   * Sem `gap`: a grade, o filtro grudado e a lista precisam de respiros diferentes, e um espaço
   * uniforme obrigava o filtro a flutuar longe do que ele filtra. Cada bloco declara o seu.
   */
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: bottomTabInset + spacing.xxl,
  },
  sectionLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  // --- Item da lista ---
  /**
   * A mesma barra lateral do card de compromisso da Home.
   *
   * É a assinatura visual do compromisso no app: quem viu o card "Se aproximando" reconhece a linha
   * aqui sem ler. O bloco de data daquele card **não** vem junto — lá ele responde "quando?", e
   * aqui o cabeçalho do dia já respondeu.
   *
   * As ações (editar, excluir) e a resposta de desfecho continuam sendo só desta tela: a Home
   * informa, o Calendário administra.
   */
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: cores.corDeDestaque,
  },
  /** Passado perde a cor da barra junto com a opacidade: nada ali ainda vai acontecer. */
  itemBarraPassada: {
    borderLeftColor: cores.outlineVariant,
  },
  /** Compromisso que já aconteceu continua legível, mas para de disputar atenção com o que vem. */
  itemPassado: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * A hora do compromisso, na mesma largura da hora das doses logo abaixo. O alinhamento é o que
   * faz o dia se ler como uma linha do tempo, e não como dois blocos que por acaso ficaram juntos.
   */
  horaDoCompromisso: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  itemHeaderText: {
    flex: 1,
  },
  tipo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /* `acoes` e `acaoBotao` saíram em 06/09, com o lápis e a lixeira do card. O card inteiro virou o
     toque, e editar/excluir vivem na listagem de Compromissos. */

  detalhe: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  observacao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  rodapeDoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  aviso: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  /**
   * A pergunta que fica devendo resposta num compromisso que já passou. Fundo neutro e não de
   * alerta: não responder não é erro, e o app não sabe se a pessoa foi ou não.
   */
  perguntaDeDesfecho: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  /** `caption` e não `bodyMd`: é rótulo de uma pergunta curta, não texto de leitura. */
  perguntaTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  botoesDeDesfecho: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  /**
   * Os mesmos botões do card de compromisso da Home, e da linha de dose.
   *
   * Antes eram dois retângulos iguais de 44 de altura, e num card que já traz hora, título,
   * profissional, local, observação e preparo eles pesavam mais que tudo acima. **36 com `hitSlop`
   * de 4** mantém o alvo real nos 44 e devolve o card ao tamanho de um item de lista — é
   * exatamente o que a linha de dose faz com "Confirmar"/"Pular", pelo mesmo motivo.
   */
  botaoDeDesfecho: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  /** "Fui": pílula cheia, como "Confirmar". É o desfecho esperado. */
  botaoFui: {
    backgroundColor: cores.primary,
  },
  botaoFuiTexto: {
    ...typography.caption,
    color: cores.onPrimary,
  },
  /** "Não fui": fundo suave, como "Pular". Saída legítima, não atalho a incentivar. */
  botaoNaoFui: {
    backgroundColor: cores.surfaceContainer,
  },
  botaoNaoFuiTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  /** O desfecho já respondido, com a cor dizendo qual foi antes de a palavra ser lida. */
  desfecho: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  desfechoTexto: {
    ...typography.label,
    flex: 1,
  },
  desfechoCompareceu: {
    color: cores.corDeDestaque,
  },
  desfechoFaltou: {
    color: cores.error,
  },
  /** A anotação do que aconteceu — o que vale a longo prazo, e por isso não fica em cinza fraco. */
  anotacaoDoDesfecho: {
    ...typography.bodyMd,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  sheetBody: {
    gap: spacing.md,
  },

  /** Um dia inteiro da agenda: o cabeçalho, os compromissos e o bloco de doses. */
  dia: {
    gap: spacing.md,
    // Separa do filtro grudado logo acima, agora que o `listContent` não tem mais `gap` uniforme.
    marginTop: spacing.sm,
  },

  /**
   * O "nada marcado" tem respiro próprio, e maior que o `gap` do dia. Ele não é mais um item da
   * lista: é a ausência dela, e colado no cabeçalho do dia parecia legenda do título. O ar em
   * volta é o que faz a frase ler como resposta à pergunta "o que tem hoje?".
   */
  vazioDoDia: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  // --- Cabeçalho de dia ---
  /**
   * O dia é o agrupador da agenda, então ele precisa de peso próprio — sem isso a lista vira uma
   * fileira de cartões onde não se enxerga onde um dia termina e o outro começa.
   */
  diaHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  diaTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  diaHoje: {
    color: cores.corDeDestaque,
  },
  diaData: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  // --- Bloco de doses do dia ---
  blocoDeDoses: {
    ...superficieDeCartao(cores, ajustes),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linhaDeDose: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  /** Divisória entre doses do mesmo dia — mais leve que um cartão por dose. */
  linhaComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  horaDaDose: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  textoDaDose: {
    flex: 1,
  },
  nomeDaDose: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  quantidadeDaDose: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** Dose já confirmada continua visível, mas para de disputar atenção com o que falta responder. */
  doseResolvida: {
    opacity: 0.55,
  },
  acoesDaDose: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  /** 44, e não 36: confirmar e pular ficam lado a lado, e trocar um pelo outro falseia o registro. */
  botaoDaDose: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainerLow,
  },

  // --- Estados ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  emptyDescription: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  errorText: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
    maxWidth: 320,
  },
}));
