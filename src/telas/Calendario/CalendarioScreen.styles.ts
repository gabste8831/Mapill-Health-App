
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
  /** Só a sombra, sem o contorno — e o `boxShadow` que estava escrito à mão virou token. */
  item: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
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
  acoes: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  /**
   * Mesmo alvo de 44 da lista de remédios. `padding: xs` sobre um ícone de 20 dava 28px de área
   * real — e um dos dois botões **exclui**, encostado no de editar. Alvo apertado ao lado de ação
   * destrutiva é onde o erro de toque custa caro.
   */
  acaoBotao: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },

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
  perguntaTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  botoesDeDesfecho: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoDeDesfecho: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // 44 é o piso de alvo de toque confortável; abaixo disso a linha vira armadilha em tela
    // pequena, e o público do app inclui quem já não acerta um toque preciso.
    minHeight: 44,
    borderRadius: radius.full,
    // Fundo suave no lugar do contorno: dois botões lado a lado dentro de um cartão sem borda,
    // contornados, voltavam a desenhar a caixinha que o cartão deixou de ter.
    backgroundColor: cores.surfaceContainer,
  },
  botaoDeDesfechoTexto: {
    ...typography.label,
    color: cores.onSurface,
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
