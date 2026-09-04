
import { estilosDoTema, fieldLabelGap, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    // Só respiro: o botão saiu do fim da rolagem e virou rodapé fixo, então não há mais o que
    // reservar aqui embaixo.
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurface,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** Sublinhado além da cor: cor sozinha não diz "clicável" para quem não distingue bem matiz. */
  linkParaTermos: {
    ...typography.bodyMd,
    color: cores.corDeDestaque,
    textDecorationLine: "underline",
  },
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  // Canto quadrado, diferente do avatar redondo da ficha: aqui é a caixa do remédio, não retrato.
  photoFrame: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: cores.surfaceContainerLow,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  /**
   * As duas maneiras de anexar a receita, lado a lado — são alternativas, não sequência.
   *
   * `flexWrap` porque em tela estreita os dois rótulos não cabem na largura que sobra ao lado da
   * miniatura de 72px: sem ele, o segundo era espremido até quebrar no meio da palavra.
   */
  acoesDeAnexo: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  /**
   * O texto ao lado da mídia: o link que age, e a dica que explica.
   *
   * Sem `gap`: o link mora num alvo de 44pt que já centraliza o texto com folga em cima e embaixo,
   * e somar espaço a essa folga afastava a dica do título que ela explica — os dois liam como dois
   * assuntos em vez de um. O respiro entre eles é o que sobra do alvo, e é o mesmo em todas as
   * seções de anexo.
   */
  photoTextGroup: {
    flex: 1,
  },
  photoAddLabel: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  /** Remover fica em vermelho ao lado de "Alterar": são ações de peso muito diferente. */
  photoRemoveLabel: {
    ...typography.label,
    color: cores.error,
  },
  photoHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * Dois campos que se leem juntos numa frase — "08:00, 10 unidades", "21 dias tomando, 7 de
   * pausa". Separá-los em linhas faria cada metade parecer uma pergunta independente.
   */
  linhaDeDose: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campoDeHorario: {
    flex: 1,
  },
  campoDeQuantidade: {
    flex: 1,
  },
  campoDeCiclo: {
    flex: 1,
  },

  /** Linha "valor atual + ação" — o resumo de uma escolha que se resolve em outro lugar. */
  rowValue: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  /**
   * A mesma linha, quando o que ela resume já está ligado. Fundo só pra separar "isto está
   * ativo" de "isto é um campo" — a linha nua se confundia com o rótulo da seção logo acima.
   */
  rowValueAtivo: {
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
  },
  rowValueText: {
    ...typography.bodyLg,
    color: cores.onSurface,
    flex: 1,
  },
  rowValueAction: {
    ...typography.label,
    color: cores.corDeDestaque,
  },

  /** Resumo do que já foi definido no popup — fichinhas, no mesmo cinza dos botões de escolha. */
  timeChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    minWidth: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
  },
  timeChipVazio: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: cores.outlineVariant,
    backgroundColor: "transparent",
  },
  timeChipErro: {
    backgroundColor: cores.errorContainer,
  },
  timeChipText: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },

  /**
   * Dentro do popup, o lugar de cada horário. Tem a mesma altura e a mesma borda de um campo de
   * texto de propósito: é ali que a resposta aparece, e trocar a caixa por um botão de aparência
   * diferente faria parecer que o horário mora em outro lugar.
   */
  botaoDeHorario: {
    // `minHeight` e não `height`: com a fonte do sistema ampliada, altura travada recorta o horário
    // — o mesmo defeito corrigido em `Button`/`TextField` em 31/08, que escapou aqui por este
    // botão ser desenhado pela tela em vez de vir do kit.
    minHeight: 52,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
  },
  botaoDeHorarioErro: {
    borderColor: cores.error,
  },
  botaoDeHorarioTexto: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /** "--:--" é lacuna, não valor: fica no cinza de placeholder pra não ser lido como resposta. */
  botaoDeHorarioVazio: {
    color: cores.outline,
  },

  /** Cancelar e confirmar lado a lado, dividindo a largura em partes iguais. */
  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acaoDaLinha: {
    flex: 1,
  },

  /**
   * O último lugar da fileira de "quantas vezes por dia": as opções cobrem o comum e este campo
   * cobre o resto, sem gastar um segundo toque nem uma segunda linha.
   */
  dosesInput: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    ...typography.bodyMd,
    color: cores.onSurface,
    textAlign: "center",
  },
  dosesInputAtivo: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },

  /** Os sete dias numa linha só, ocupando a largura toda — a semana se lê de uma vez ou não se lê. */
  weekdayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  weekday: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
  },
  weekdaySelected: {
    backgroundColor: cores.primary,
  },
  weekdayText: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  weekdayTextSelected: {
    color: cores.onPrimary,
  },

  submitHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  fieldErrorText: {
    ...typography.bodyMd,
    color: cores.error,
  },
  /**
   * Duas informações que o paciente deu e que não fecham entre si: estoque menor que o
   * tratamento, prazo que não alcança dose nenhuma, antecedência maior que o estoque.
   *
   * Vermelho, e não o laranja de atenção que estava aqui antes. Não porque o campo seja
   * inválido, mas porque a combinação não funciona do jeito que foi pedida, e laranja no meio de
   * texto cinza lia como enfeite. O app continua deixando salvar; quem decide é o paciente.
   */
  avisoDeConflito: {
    ...typography.bodyMd,
    color: cores.error,
    backgroundColor: withOpacity(cores.error, 0.08),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /**
   * Aviso que vem com uma ação junto (a diferença de doses do prazo, e o botão de estender).
   * O `gap` mantém o botão colado no texto que o explica, em vez de solto na seção.
   */
  avisoDePrazo: {
    gap: spacing.sm,
  },

  /** Explicação que não é campo nem erro — texto de apoio que merece peso, tipo regra do sistema. */
  sectionHintDestaque: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /**
   * O conteúdo do "como funcionam" inteiro, num fundo azul claro. É explicação, não campo nem
   * alerta: o fundo separa esse registro do resto do popup sem usar a cor de atenção, que
   * gritaria por uma leitura tranquila.
   */
  blocoDeAjuda: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
  },
  /**
   * Um assunto, com título curto e o texto. Título e não lista corrida: quem abre o acordeão
   * está procurando uma resposta específica, e o título é o que deixa varrer sem ler tudo.
   */
  assuntoDeAjuda: {
    gap: spacing.xs,
  },
  assuntoDeAjudaTitulo: {
    ...typography.label,
    color: cores.onSecondaryContainer,
  },
  assuntoDeAjudaTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * Azul junto do resto da explicação, e não a cor de conflito: depois que o texto virou
   * condição ("com permissão e volume, os alertas chegam"), pintá-lo de alerta contradiria o
   * que ele diz. Vermelho fica reservado para o que realmente não fecha.
   */
  avisoDePermissao: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
  },
  avisoDePermissaoTitulo: {
    ...typography.label,
    color: cores.onSecondaryContainer,
  },
  avisoDePermissaoTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * Resumo de uma configuração feita em popup. Rótulo e valor em colunas, porque "50 comprimidos
   * · em cima da geladeira" numa linha só obriga a decifrar o que é o quê pelo conteúdo.
   */
  resumoBloco: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
  },
  resumoLinha: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
  },
  resumoRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 96,
  },
  resumoValor: {
    ...typography.bodyLg,
    color: cores.onSurface,
    flex: 1,
  },
  sheetBody: {
    gap: spacing.md,
  },

  /**
   * A virada de "só o essencial" para "o resto também". Acontece uma vez só, e é anunciada: se
   * cada seção nascesse conforme o paciente digita, a tela pularia debaixo do dedo e ninguém
   * perceberia que algo apareceu.
   *
   * Respiro maior dos dois lados (`lg`, e não só `sm` no topo) porque este bloco marca a virada
   * de etapa — precisa de mais ar que o espaço comum entre cartões, senão lê como mais um item
   * da lista em vez do intervalo que ele é. O traço acima reforça a mesma ideia visualmente.
   */
  revelacao: {
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: cores.outlineVariant,
    alignItems: "center",
  },
  revelacaoTitulo: {
    ...typography.bodyLg,
    color: cores.corDeDestaque,
    textAlign: "center",
  },
  revelacaoHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  /** Saída de uma configuração já ligada — discreta, porque desligar é exceção e não atalho. */
  textoDeSaida: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  /**
   * O alvo em volta de um link de texto solto (a saída do estoque, "Ler os Termos").
   *
   * Estes são `Text` dentro de `Pressable` sem contêiner próprio: a área tocável tinha a altura da
   * linha, e não havia superfície onde pintar o toque. O padding resolve as duas coisas de uma vez
   * — alvo de dedo, e algo que responda quando o dedo chega.
   */
  alvoDeLink: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  /**
   * O mesmo alvo, mas **rente à esquerda** — para o link que encabeça um bloco de texto ao lado de
   * uma mídia (a foto da caixa, o anexo da receita).
   *
   * O `paddingHorizontal` do `alvoDeLink` empurrava o título 8px para dentro enquanto a dica
   * abaixo, um `Text` solto, começava no zero. As duas linhas do mesmo bloco saíam desalinhadas
   * entre si e nenhuma ficava rente ao quadrado da mídia, que é a borda que o olho usa como
   * referência. Aqui o respiro lateral vem do `gap` da linha, não do alvo.
   *
   * A área de dedo vem do `hitSlop`, e não de `minHeight`: com 44 de altura fixa sobrava folga
   * vertical dentro do alvo (o texto tem ~20), e essa folga abria um vão visível entre o link e a
   * dica logo abaixo. O `hitSlop` estende o alcance do toque para fora da caixa sem ocupar espaço
   * no layout — mesma proteção, sem o buraco.
   */
  alvoDeLinkRente: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    borderRadius: radius.md,
  },

}));
