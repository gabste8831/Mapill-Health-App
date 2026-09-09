import { estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * O cartão de uma dose: os dados em cima, as duas ações embaixo dividindo a largura.
   *
   * `superficieDeCartao` sem nada por cima — o mesmo cartão do "Acompanhamento semanal" logo
   * abaixo na Home, e o mesmo de Remédios, Compromissos e Estoque. Repetir fundo, raio e sombra à
   * mão aqui era o que fazia esta linha destoar dos cartões vizinhos, e é a cópia que o token
   * existe para evitar. De quebra, ele troca a sombra por contorno no alto contraste, onde sombra
   * não se enxerga.
   */
  base: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.md,
  },
  /**
   * O corpo tocável dentro do cartão: só os dados da dose.
   *
   * Sem estilo de superfície própria — fundo, canto e sombra pertencem ao cartão (`base`), que é
   * uma `View` comum justamente porque o Reanimated não aplicava o `boxShadow`.
   */
  corpo: {
    gap: spacing.md,
  },
  /**
   * Os estados usam **faixa lateral**, e não borda em volta do cartão inteiro.
   *
   * A borda completa somada ao fundo colorido dava ao cartão o peso de um alerta de sistema — três
   * desses na agenda e a tela vira um painel de avisos. A faixa à esquerda diz a mesma coisa com um
   * gesto só, e é a mesma linguagem da `Dica` e dos blocos de permissão.
   */
  highlighted: {
    borderLeftWidth: 4,
    borderLeftColor: cores.primary,
  },
  /**
   * Atrasada usa a cor de erro, e não a de atenção: é a única linha da agenda que representa algo
   * que já deveria ter acontecido e não aconteceu (decisão nº11.5 — ela nunca se resolve sozinha,
   * então precisa continuar pedindo resposta).
   *
   * Só a faixa muda de cor: o fundo do cartão continua branco, como o de qualquer outro cartão do
   * app. Tingir o fundo inteiro fazia a agenda de um dia comum — que tem sempre alguma dose na hora
   * ou atrasada — virar uma pilha de blocos coloridos, e o cartão deixava de parecer parte da mesma
   * família dos outros da Home.
   */
  late: {
    borderLeftWidth: 4,
    // A faixa é forma, não texto: leva o vermelho vivo, que é o que faz o cartão atrasado saltar
    // de relance na pilha.
    borderLeftColor: cores.errorVivo,
  },
  /**
   * "É agora" ganha o mesmo peso da atrasada: as duas pedem ação imediata, e é essa diferença —
   * pede agora × está na fila — que o destaque precisa carregar. O que separa uma da outra é a cor
   * da faixa, e o rótulo de estado na coluna da hora.
   */
  now: {
    borderLeftWidth: 4,
    borderLeftColor: cores.successVivo,
  },
  /**
   * O escurecimento do toque numa linha já resolvida (a que abre a correção retroativa).
   *
   * É um fundo, e não opacidade: a opacidade da linha pertence à animação de acomodação, e um
   * segundo valor absoluto por cima faria a linha clarear ao ser tocada em vez de escurecer.
   *
   * A opacidade do estado resolvido **não mora aqui**: ela é animada no componente, para a linha se
   * acomodar em vez de trocar de aparência num quadro só. Um estilo estático junto do animado faria
   * os dois se multiplicarem, e a linha resolvida chegaria a 0.25.
   */
  pressionada: {
    backgroundColor: cores.surfaceContainer,
  },

  /**
   * Hora e estado à esquerda, remédio e dose à direita — num nó só para o leitor de tela.
   *
   * Sem agrupar, o TalkBack para quatro vezes na mesma linha e anuncia o estado antes do nome do
   * remédio, que é o contrário do que se quer ouvir.
   */
  /**
   * `stretch` para os dois filhos terem a altura da linha: é isso que dá à coluna da hora o espaço
   * para se centrar dentro dela (com `flex-start` ela encolheria ao próprio texto, e `center`
   * dentro dela não teria o que distribuir).
   */
  /**
   * `sm` e não `md` entre a hora e o nome: os 8px que saem daqui vão inteiros para o nome do
   * remédio, que é o texto que decide se a linha é lida de relance ou soletrada. A coluna da hora
   * tem largura fixa, então o espaço economizado não some — ele muda de lado.
   */
  infoAgrupada: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  /**
   * Guarda `08:00` e o rótulo do estado embaixo, um sob o outro.
   *
   * `center` no eixo vertical: o bloco da direita cresce quando o nome do remédio quebra em duas
   * linhas, e a hora alinhada pelo topo ficava pendurada no canto. Centrada, ela acompanha o
   * conteúdo qualquer que seja a altura dele.
   */
  /**
   * 60: o que "ATRASADA" (o rótulo mais largo depois que "PRÓXIMA DOSE" encurtou) pede em
   * `caption`, e nada além disso. A coluna é de largura fixa, então cada pixel a menos aqui é um
   * pixel a mais para o nome do remédio.
   */
  timeColumn: {
    width: 60,
    gap: 2,
    justifyContent: "center",
  },
  time: {
    ...typography.label,
    fontSize: 16,
    color: cores.onSurface,
  },
  statusLabel: {
    ...typography.caption,
    color: cores.corDeDestaque,
  },
  statusLabelUpcoming: {
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  /**
   * "É AGORA" e "ATRASADA" usam os tokens de **texto** (`success` / `error`), e não os `on*Container`.
   *
   * Os `on*Container` são calibrados para ficar sobre o container cheio — são quase pretos (9.9:1) e
   * têm outro matiz (356°, do lado do roxo). Sobre o cartão branco eles davam ao rótulo um vermelho
   * escuro que não se parecia com o vermelho da faixa logo ao lado, e o cartão exibia dois tons
   * diferentes da mesma cor a um centímetro de distância.
   *
   * Não são os tons **vivos** porque este é texto de 10pt, onde a WCAG exige 4.5:1 sem desconto — o
   * vermelho vivo dá 4.00:1 e o verde vivo 3.45:1 sobre branco. `error` (6.03:1) e `success`
   * (5.02:1) passam, e compartilham o matiz dos vivos: mesma cor, intensidade diferente.
   *
   * A vivacidade não se perde, porque quem vê o cartão vê a faixa primeiro — ela tem quatro pixels
   * de largura e a altura toda, contra oito caracteres em corpo 10.
   */
  statusLabelNow: {
    color: cores.success,
  },
  statusLabelLate: {
    color: cores.error,
  },
  /** Nome do remédio e, abaixo, a dose. Ocupa o que sobra da largura depois da coluna da hora. */
  content: {
    flex: 1,
    gap: 2,
  },
  medicationName: {
    ...typography.headlineSm,
    fontSize: 16,
    // O `headlineSm` traz 24, que basta para 18px mas nao para 16 dentro de um bloco com `gap`
    // apertado: a perna do "p" de "Dipirona" encostava na linha da dose.
    lineHeight: 21,
    color: cores.onSurface,
  },
  /** Só a pulada é riscada: a tomada não é uma tarefa cancelada, é uma tarefa cumprida. */
  medicationNameSkipped: {
    textDecorationLine: "line-through",
  },
  note: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /** Os dois botões dividem a largura do cartão, meio a meio. */
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  /**
   * Pílula, e não retângulo de canto suave: acompanha as fichinhas de horário do resto do app.
   *
   * A caixa tem 36, e o alvo de toque volta aos 44 pelo `hitSlop` no componente: estes são os dois
   * alvos mais tocados do aplicativo — a agenda do dia é a tela onde a dose se confirma —, e errar
   * o toque aqui **falseia o registro clínico**, gravando uma dose que não foi tomada. O que
   * encolheu foi o desenho, não a área que o dedo alcança.
   *
   * Escapou da varredura de 31/08 porque aquela corrigiu o kit (`Button`, `TextField`), e estes
   * botões são desenhados pela própria tela.
   */
  confirmButton: {
    flex: 1,
    // 44 continua sendo o alvo real de toque, garantido pelo `hitSlop` no componente. O que encolhe
    // é a caixa desenhada: com os dois dividindo a largura do cartão, a pílula cheia pesava mais
    // que a dose que ela responde.
    minHeight: 36,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.primary,
  },
  confirmButtonText: {
    ...typography.caption,
    color: cores.onPrimary,
    textAlign: "center",
  },
  /**
   * "Pular" é discreto de propósito: é uma saída legítima, não um atalho a ser incentivado.
   *
   * Fundo suave no lugar da borda cinza — mesma razão dos cartões: contorno de 1px sobre superfície
   * clara lê como campo de formulário, e aqui é um botão.
   */
  skipButton: {
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  skipButtonText: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
