
import { estilosDoTema, fieldLabelGap, listGap, radius, screenPadding, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

/**
 * Altura da barra diária. Exportada porque a tela calcula a altura preenchida com ela.
 *
 * 80, o mesmo `BAR_ROW_HEIGHT` do card semanal da Home: os dois gráficos mostram o mesmo dado e não
 * têm por que ter escalas diferentes.
 */
const ALTURA_DA_BARRA = 80;

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },

  /**
   * O número grande, que é o que a pessoa veio ver — e o que ela vai mostrar ao médico.
   *
   * Em azul cheio, e não em cartão branco: é o único dado que esta tela existe para entregar, e
   * sobre branco ele era texto grande solto no meio de outros cartões brancos. A cor aqui não é
   * decoração — é o que diz qual dos blocos da tela é a resposta.
   */
  destaque: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  /** 48 e nao um token: numero de exibicao, unico no app. Criar token para um uso so infla a escala. */
  destaqueTaxa: {
    ...typography.headlineMd,
    fontSize: 48,
    lineHeight: 56,
  },
  destaqueLegenda: {
    ...typography.bodyMd,
    color: withOpacity(cores.onPrimary, 0.85),
  },

  /**
   * As três faixas de cor. Só a cor muda — nunca o tamanho, nem o ícone, nem uma mensagem de
   * incentivo. A cor orienta a leitura; o julgamento fica com o médico.
   *
   * Valem **só na lista por medicamento**, e isso é o ponto: ali a cor aponta para uma ação — qual
   * remédio está falhando. Nos outros dois lugares ela saiu de propósito. No número em destaque,
   * porque ele mora no bloco azul e nenhuma das três teria contraste (um número vermelho dentro de
   * um bloco azul leria como erro do aplicativo, não como informação sobre o tratamento). Na faixa
   * dos sete dias, porque pintava um veredito diário que ninguém trata dia a dia, e ainda fazia os
   * dois gráficos do app falarem línguas diferentes sobre o mesmo número.
   */
  taxa_boa: {
    color: cores.success,
  },
  taxa_media: {
    color: cores.onWarningSurface,
  },
  taxa_baixa: {
    color: cores.error,
  },
  /** O número dentro do bloco azul. */
  destaqueTaxaTexto: {
    color: cores.onPrimary,
  },

  contagens: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  /**
   * Os três cartõezinhos lado a lado mantêm `padding: md`, e não o `gutter` do `superficieDeCartao`: em
   * três colunas numa tela de celular, 24 de respiro interno não sobra largura para o número.
   */
  contagem: {
    ...superficieDeCartao(cores, ajustes),
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  contagemValor: {
    ...typography.headlineMd,
    color: cores.onSurface,
  },
  contagemRotulo: {
    ...typography.label,
    color: cores.onSurface,
  },
  /** A explicação em letra menor: o rótulo sozinho não distingue "pulada" de "sem resposta". */
  contagemDica: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  linha: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  linhaDetalhe: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  linhaTaxa: {
    ...typography.headlineSm,
  },
  /**
   * A faixa dos sete dias: um cartão só, sete colunas dentro.
   *
   * `padding: md` pelo mesmo motivo dos cartõezinhos de contagem — com o `gutter` de 24 do
   * `superficieDeCartao`, sete colunas não sobrariam largura para o número.
   */
  diaFaixa: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    padding: spacing.md,
    // O mesmo respiro entre colunas do card da Home.
    gap: spacing.sm,
  },
  diaColuna: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  /**
   * A coluna da barra. Mesmas medidas do card semanal da Home, de propósito.
   *
   * Dois gráficos da mesma informação com desenhos diferentes fazem o leitor perguntar se são a
   * mesma coisa. São: as sete barras daqui e as de lá saem do mesmo cálculo. Sem trilho atrás e com
   * a altura maior (80, e não 56) porque foi a leitura que ficou mais clara no aparelho.
   */
  diaTrilho: {
    width: "100%",
    height: ALTURA_DA_BARRA,
    justifyContent: "flex-end",
  },
  /**
   * Azul, e não as três cores das faixas.
   *
   * A faixa clínica (verde/amarelo/vermelho) segue viva na lista **por medicamento**, que é onde ela
   * responde uma pergunta acionável: qual remédio está falhando. Na semana ela pintava sete colunas
   * de um veredito diário que ninguém trata dia a dia — e ainda deixava os dois gráficos do app
   * falando línguas diferentes sobre o mesmo número.
   *
   * A altura carrega a informação, como no card da Home.
   */
  diaBarra: {
    width: "100%",
    backgroundColor: cores.primary,
    borderRadius: 2,
    opacity: 0.2,
  },
  /** Hoje em opacidade cheia, igual à Home: o dia corrente é o único que ainda pode mudar. */
  diaBarraHoje: {
    opacity: 1,
  },
  /** Traço fino de "não havia dose", visualmente distinto de uma barra curta. Igual ao da Home. */
  diaBarraVazia: {
    height: 2,
    backgroundColor: cores.outlineVariant,
    borderRadius: 2,
  },
  /** A inicial do dia da semana. Repete (S D S T Q Q S) — a data embaixo é quem desempata. */
  diaSigla: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  /** Hoje ganha peso, não cor: a cor da coluna já está reservada para a faixa da taxa. */
  diaHojeTexto: {
    color: cores.onSurface,
    fontWeight: "700",
  },
  /**
   * O número sem o `%`.
   *
   * `bodyLg` e não `headlineSm`: em sete colunas o headline estoura em "100" nas fontes grandes do
   * sistema, e um número cortado é pior que um número menor.
   */
  /**
   * O número, em azul como a barra.
   *
   * A cor aqui não classifica — só amarra o número à coluna dele. Quem quiser a leitura por faixa a
   * encontra na lista por medicamento, onde ela aponta para uma ação.
   */
  /**
   * O número do dia. `bodySm`, e não `bodyLg`: são sete colunas dividindo a largura da tela, e
   * "100%" é o valor mais largo que pode aparecer — em `bodyLg` ele não cabia e saía cortado, logo
   * no dia de adesão perfeita, que é justamente o que ninguém quer ver truncado.
   */
  diaValor: {
    ...typography.bodySm,
    fontWeight: "700",
    // `corDeDestaque` e nao `primary`: aqui o azul e tinta sobre o cartao branco, e no tema escuro
    // `primary` e o navy de fundo — 1.6:1 contra a superficie, um numero que nao se le.
    color: cores.corDeDestaque,
  },
  /**
   * O `%` colado no número, menor e mais leve.
   *
   * Herda a cor do `Text` que o contém, então acompanha a faixa sem repetir os três estilos. Menor
   * porque o número é o dado e o símbolo é só a unidade — e porque em sete colunas ele precisa
   * caber sem roubar largura do valor.
   */
  diaValorUnidade: {
    ...typography.caption,
    fontWeight: "600",
  },
  /**
   * O traço do dia sem dose. Cinza e discreto: não é um resultado ruim, é ausência de resultado.
   *
   * **Mesma tipografia do número**, e não uma menor: as sete colunas dividem a mesma linha, e um
   * traço mais baixo que o número desalinha as barras logo abaixo dele.
   */
  diaSemDado: {
    ...typography.bodySm,
    fontWeight: "700",
    color: cores.onSurfaceVariant,
    opacity: 0.5,
  },
  diaData: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    opacity: 0.6,
  },

  /**
   * O bloco das doses não tomadas, com a superfície dos cartões da tela.
   *
   * O fundo padrão do `Accordion` é `surfaceContainerLow`, que quase empata com o fundo da tela —
   * certo nos textos longos (termos, consentimento), onde ele é parágrafo. Aqui, entre a faixa dos
   * sete dias e a seção de exportar, ele sumia: nada dizia que havia algo a abrir. Como o
   * `Accordion` já traz o próprio raio e sombra, só a cor precisa vir daqui: a mesma
   * `surfaceContainerLowest` dos cartões vizinhos, para o bloco pertencer à tela em vez de flutuar.
   */
  perdidasBloco: {
    backgroundColor: cores.surfaceContainerLowest,
    // No alto contraste os cartões trocam sombra por borda; sem isto o acordeão seria o único
    // bloco sem contorno da tela, que é onde a sombra justamente não se enxerga.
    ...(ajustes?.contornarSuperficies
      ? { borderWidth: 1, borderColor: cores.outlineVariant }
      : null),
  },

  /**
   * Aqui a linha divisória fica: são registros curtos e repetidos, não cartões — vinte deles em
   * cartão separado viram uma escada. O traço só clareou, porque `outlineVariant` num divisor
   * interno pesa como moldura de tabela.
   */
  perdida: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.surfaceContainerHigh,
  },
  perdidaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /**
   * Cinza, e não vermelho. A lista inteira já é de doses não tomadas — pintar cada linha de erro
   * transformaria um registro clínico numa fileira de repreensões, e quem lê isso sobre a própria
   * semana tende a parar de registrar em vez de parar de esquecer.
   */
  perdidaSelo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  rodape: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
  },

  /**
   * A linha que abre o seletor de medicamentos — mesma anatomia do resumo de estoque no cadastro:
   * rótulo em cima, o que está escolhido embaixo, e o toque abre o popup. O estado atual fica
   * legível sem abrir nada, que é o que evita gerar um relatório recortado sem perceber.
   */
  /**
   * O traço que separa "como tenho ido" de "levar isso para fora do app".
   *
   * Um traço, e não outro cartão: são dois assuntos da mesma tela, não duas telas. O respiro maior
   * em cima do que embaixo é o que faz a seção de baixo começar, em vez de continuar a de cima.
   */
  divisorDeEscopo: {
    height: 1,
    backgroundColor: cores.outlineVariant,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  /**
   * `gutter` (24) e não o `listGap` (16) das listas: aqui não são itens de uma coleção, são
   * decisões independentes — o período, o que entra e o gerar. Com o espaço de uma lista elas liam
   * como um bloco só, e nenhuma parecia pedir escolha.
   */
  secaoDeExportar: {
    gap: spacing.gutter,
  },
  /**
   * O cabeçalho é o único que **não** segue o ritmo dos controles.
   *
   * Ele apresenta a seção inteira, então o respiro embaixo dele marca a virada de "isto é o que
   * você vai gerar" para "estas são as escolhas". Com o mesmo `gutter` dos demais, o título virava
   * mais um item da pilha.
   */
  exportarTopo: {
    // Empilhado: sem o icone ao lado, nao ha o que alinhar na horizontal — o titulo e a frase que
    // o explica sao duas linhas de texto, e o `gap` entre elas e o mesmo dos rotulos de campo.
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  /**
   * O período dentro da seção do relatório: rótulo em cima, fileira embaixo.
   *
   * O `fieldLabelGap` é o mesmo dos formulários — o rótulo pertence ao controle logo abaixo, e
   * qualquer outro valor faria a fileira flutuar longe do que a nomeia.
   */
  periodoDoRelatorio: {
    gap: fieldLabelGap,
  },
  periodoRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  /**
   * Os dois seletores andam juntos, com menos espaço entre si que o do resto da seção.
   *
   * Eles respondem à mesma pergunta — "o que entra no documento?" — e são a mesma forma de linha
   * com seta. Separados pelo `gutter` da seção, liam como dois assuntos distintos; encostados, como
   * duas metades de um.
   */
  gruposDoRelatorio: {
    gap: spacing.sm,
  },
  /**
   * O ícone, **sem o quadrado colorido atrás**.
   *
   * Ele já teve fundo `primaryContainer`, e o conjunto — quadradinho de cor com título em negrito
   * ao lado — é o cabeçalho de card que todo gerador de site produz. Fora isso a cor não fazia
   * trabalho nenhum: azul aqui não distingue esta seção de nada, porque não há outra seção com
   * ícone para ela contrastar. O app reserva cor para função (vermelho é atraso, verde é agora), e
   * um azul decorativo enfraquece essa regra em todo lugar onde ela importa.
   *
   * A largura fixa fica, para o texto ao lado alinhar pela mesma coluna.
   */
  /**
   * `headlineSmRegular` e não `headlineSm`: peso normal.
   *
   * Este título apresenta a seção, não disputa a tela com o número grande da adesão lá em cima. Em
   * negrito ele competia com o único dado que a tela existe para entregar.
   */
  exportarTitulo: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  /** `bodySm`: é a linha que explica o título, não um assunto próprio. */
  exportarDescricao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  /**
   * Em linha, para a seta caber à direita do texto.
   *
   * **Baixa de propósito.** Ela já foi um cartão de duas linhas empilhadas com `padding` de 16 — um
   * alvo da altura de um card de conteúdo para um toque que só abre um popup. O peso visual
   * prometia mais do que a linha entrega, e as duas seguidas ocupavam mais tela que o gráfico da
   * adesão. Agora rótulo e valor dividem a mesma linha, e a altura cai para pouco mais que o alvo
   * mínimo de toque.
   */
  filtro: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  /**
   * A mesma linha, quando não há o que escolher.
   *
   * Continua visível para a pessoa saber o que o documento leva, mas sem a seta e sem resposta ao
   * toque: prometer uma lista que não existe é pior que não oferecer a escolha. O tom mais apagado
   * é o que separa "informação" de "decisão a tomar".
   */
  filtroVazio: {
    opacity: 0.6,
  },
  /**
   * Rótulo e valor na **mesma linha**, e não empilhados.
   *
   * O rótulo diz o assunto e o valor diz o estado ("Todos", "2 de 3"): lado a lado eles se leem
   * como uma frase, e a linha inteira passa a caber na altura de um toque. Empilhados custavam
   * duas alturas de texto mais o vão entre elas para dizer o mesmo.
   */
  filtroTexto: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filtroRotulo: {
    ...typography.bodyMd,
    color: cores.onSurface,
    // Cede a largura ao valor antes de o valor truncar: o rotulo se adivinha pela metade
    // ("Medicamentos no relat..."), o estado nao.
    flexShrink: 1,
  },
  filtroValor: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    // Encostado na seta, longe do rotulo: e o estado, e o olho o procura junto do que abre a
    // escolha, nao colado no assunto.
    marginLeft: "auto",
  },

  /** O conteúdo do popup de seleção. */
  folha: {
    gap: listGap,
  },
  folhaAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  folhaAcao: {
    flex: 1,
  },
  folhaItem: {
    paddingVertical: spacing.xs,
  },
}));

export const alturaDaBarra = ALTURA_DA_BARRA;
