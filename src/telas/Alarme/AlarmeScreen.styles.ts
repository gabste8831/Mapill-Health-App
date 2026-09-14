
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Fundo **azul cheio**, e não o cinza claro do resto do app.
   *
   * É a única tela do Mapill que não parece o Mapill, e isso é intencional: ela irrompe sobre a
   * tela de bloqueio, muitas vezes no escuro, e precisa ser reconhecida em meio segundo como "o
   * alarme do remédio" — não como mais uma tela do aplicativo. A cor cheia também separa o que
   * exige resposta agora do que se consulta com calma.
   */
  safeArea: {
    flex: 1,
    backgroundColor: cores.primary,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.gutter,
    // Sem `paddingTop`: o cabeçalho fixo já fecha com `paddingBottom`, e somar os dois abria um vão
    // entre a hora e o primeiro remédio maior que o espaço entre os remédios.
    paddingBottom: spacing.md,
  },

  /**
   * Fixo no topo, fora da rolagem — por isso traz o próprio recuo lateral.
   *
   * Dentro do `ScrollView` ele herdava o `paddingHorizontal` do `conteudo`; fora dele, sem isto, o
   * título encostaria na borda enquanto a lista abaixo continuaria recuada.
   */
  cabecalho: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    // Folga maior embaixo: é ela que separa a hora do primeiro cartão, e o cabeçalho precisa se ler
    // como bloco à parte da lista — não como o primeiro item dela.
    paddingBottom: spacing.md,
  },
  titulo: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.8,
    textAlign: "center",
  },
  hora: {
    ...typography.headlineXl,
    fontSize: 72,
    lineHeight: 80,
    color: cores.onPrimary,
  },

  /**
   * Ocupa tudo o que sobra abaixo do cabeçalho, com o remédio centrado nesse espaço.
   *
   * `flex: 1` é o que faz o nome e a foto ficarem no meio da tela em vez de logo abaixo da hora — e
   * com vários remédios a lista simplesmente cresce e empurra o rodapé, que é quando o `ScrollView`
   * passa a rolar.
   */
  lista: {
    flex: 1,
    justifyContent: "center",
    // `md` e não `lg`: o vão de 32dp fazia sentido quando os itens eram blocos soltos no azul.
    // Com o fundo claro delimitando cada cartão, a separação já está feita — e o espaço que sobra
    // é o que falta para o terceiro remédio caber na tela.
    gap: spacing.md,
  },
  item: {
    alignItems: "center",
    gap: spacing.xs,
  },
  foto: {
    width: 132,
    height: 132,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  /** Branco sobre o azul: é o texto mais importante do app, lido sem óculos e recém-acordado. */
  nome: {
    ...typography.headlineMd,
    fontSize: 30,
    lineHeight: 38,
    color: cores.onPrimary,
    textAlign: "center",
  },
  /**
   * O item da lista enxuta: alinhado à esquerda, separado por espaço.
   *
   * Centralizado como o de uma dose, três remédios viravam três blocos flutuando no meio da tela,
   * sem eixo comum para o olho seguir. À esquerda eles se leem como lista — que é o que são.
   *
   * **Sem linha divisória, desde 14/09.** A miniatura já marca onde cada item começa, e o espaço
   * entre eles basta para separá-los — a régua cinza só somava ruído numa tela que se lê de
   * madrugada. É a mesma escolha do resto do app: separar por espaço e sombra, não por borda.
   */
  itemEnxuto: {
    alignItems: "stretch",
    // Simétrico de propósito: metade em cima e metade embaixo somava espaço desigual entre o
    // primeiro item e o cabeçalho. Aqui o `gap` da lista é quem separa, e cada item respira igual.
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    /**
     * Um azul mais claro que o fundo, para o item se ler como cartão.
     *
     * Branco a 12% sobre o azul da tela, e não uma cor fixa: assim o cartão acompanha o fundo em
     * vez de brigar com ele, e continua valendo se o tom da tela mudar. É a mesma construção do
     * círculo do ícone no cabeçalho.
     *
     * Substitui a régua que separava os itens até 14/09 — o fundo delimita cada um sem somar uma
     * linha a mais numa tela que se lê de madrugada.
     */
    backgroundColor: withOpacity(cores.onPrimary, 0.12),
    borderRadius: radius.lg,
  },
  /** As duas faixas do cartão: identificação em cima, detalhes embaixo. */
  itemEmFaixas: {
    gap: spacing.sm,
  },
  /**
   * A faixa de cima: foto à esquerda, nome e dose à direita.
   *
   * `center` para a foto acompanhar o meio do par nome/dose — são duas linhas de altura conhecida,
   * ao contrário do bloco de detalhes, que varia com o que foi cadastrado.
   */
  identificacao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /** Nome e dose ocupam o que sobra ao lado da foto. */
  nomeEDose: {
    flex: 1,
    gap: 2,
  },
  /**
   * A faixa de baixo: orientação, observação e local, na **largura inteira** do cartão.
   *
   * É o ganho da disposição em faixas — estas linhas são as que mais crescem, e presas à coluna ao
   * lado da foto quebravam cedo demais.
   */
  detalhesDoItem: {
    gap: 2,
  },
  /**
   * 64dp: grande o bastante para a caixa se reconhecer pela cor e pela forma, sem tomar a linha.
   *
   * Os 132dp da tela de uma dose não cabem aqui — três deles empilhados não deixam espaço para mais
   * nada. Mas os 44dp de antes erravam para o outro lado: a foto existe para distinguir uma caixa
   * da outra, e nesse tamanho ela virava um selo que não se lia de madrugada (retorno do Gabriel em
   * 14/09).
   *
   * **Centrada na altura do item**, e não alinhada ao nome. Com a orientação de tomada de volta, a
   * coluna de texto tem três ou quatro linhas, e a foto presa ao topo deixava um vão embaixo dela —
   * a linha ficava com dois eixos diferentes. Centrada, o item se lê como um bloco só.
   */
  miniatura: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignSelf: "center",
  },
  /** A coluna de texto ocupa o que sobra, e é o eixo com que o local se alinha. */
  textoDoItem: {
    flex: 1,
    gap: 2,
  },
  /**
   * O nome na lista enxuta.
   *
   * 18px e não os 30 da tela de uma dose: com três remédios, três títulos em corpo grande disputam
   * a tela e nenhum se destaca — o tamanho deixa de significar importância quando tudo é grande.
   * Aqui o nome precisa ser lido, não anunciado.
   */
  nomeCompacto: {
    ...typography.headlineSm,
    color: cores.onPrimary,
    textAlign: "left",
  },
  /** A quantidade acompanha o nome: um degrau abaixo, e alinhada com ele. */
  quantidadeCompacta: {
    ...typography.bodyLg,
    color: cores.onPrimary,
    opacity: 0.85,
    textAlign: "left",
  },
  /**
   * A orientação de tomada na lista — "em jejum", "com água".
   *
   * **Fica, e isso é regra e não estética.** Cheguei a cortá-la para a lista caber; o Gabriel
   * corrigiu em 12/09, e com razão: quem toma em jejum precisa saber no instante em que levanta, e
   * não depois de já ter comido. Caber é problema de escala, e se resolve no corpo do texto.
   *
   * `bodySm` com entrelinha apertada: duas linhas dela ainda somam menos que uma linha em `bodyLg`,
   * que é o corpo da versão de uma dose só.
   */
  orientacaoCompacta: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: "left",
  },
  /** As etiquetas quebram linha quando são muitas — seis orientações não cabem numa só. */
  etiquetas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginVertical: 2,
  },
  /**
   * Cada orientação vira uma etiqueta com fundo próprio.
   *
   * Mais clara que o cartão (18% contra os 12% dele), para se destacar **dentro** dele: é a regra
   * da tomada, e quem lê de madrugada precisa distinguí-la da observação livre logo abaixo. Como
   * texto corrido, as duas se liam como a mesma coisa.
   */
  etiqueta: {
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  textoDaEtiqueta: {
    ...typography.bodySm,
    color: cores.onPrimary,
  },
  /** Na tela de uma dose só tudo é centrado, e as etiquetas acompanham. */
  etiquetasCentradas: {
    justifyContent: "center",
  },
  /**
   * A observação do tratamento, um degrau abaixo da orientação de tomada.
   *
   * Mais apagada de propósito: ela é sobre o tratamento como um todo ("comprar mais na farmácia da
   * esquina"), não sobre como engolir esta dose. Com o mesmo peso da orientação, competiria com a
   * informação que decide a tomada — e é a orientação que precisa ser lida primeiro.
   */
  observacaoCompacta: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    opacity: 0.65,
    lineHeight: 20,
    textAlign: "left",
  },
  /** O local na lista, um degrau abaixo do `localTexto` da tela de uma dose. */
  localCompacto: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },
  /**
   * A lista **mínima**, de quatro remédios em diante: só nome e quantidade.
   *
   * Nasceu em 12/09, quando o Gabriel testou com quatro e encontrou a tela vazia entre o horário e
   * os botões — a versão anterior não listava nada acima de três, só uma frase mandando abrir o
   * app. "Você tem 4 remédios" sem os nomes não é informação: é o aviso de que a informação está
   * em outro lugar, numa tela que existe justamente para dizer o que está acontecendo agora.
   *
   * É o terceiro degrau de escala da tela, e o que ele corta é o que **não** decide se a pessoa
   * levanta: foto, orientação de tomada e local. O nome fica porque responde "é o da pressão ou o
   * do sono?", e a quantidade porque vem junto dele em uma linha só.
   *
   * `gap` menor que o da lista de três: aqui cada item é uma linha, e o respiro de um bloco entre
   * linhas simples faria quatro nomes ocuparem o que seis ocupariam.
   */
  /**
   * A lista de quatro ou mais, centrada na altura como a de dois ou três.
   *
   * `flex: 1` para ela tomar o espaço entre o cabeçalho e o rodapé, e `justifyContent: "center"`
   * para os remédios ficarem no meio dele — presa ao topo, a lista deixava um vão embaixo que só
   * aparecia nesta forma da tela, e as três formas passavam a se comportar de jeitos diferentes.
   */
  listaMinima: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
  },
  /**
   * Nome e quantidade lado a lado, e não empilhados.
   *
   * Empilhado, cada remédio vira dois níveis e a lista dobra de altura — com seis remédios a tela
   * volta a rolar, que é o que este degrau existe para evitar. Lado a lado, o nome fica com o
   * espaço que sobrar e a quantidade ocupa o que precisa.
   */
  itemMinimo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
    // O mesmo cartão da lista de dois ou três: as duas formas são a mesma tela vista com mais ou
    // menos remédios, e um fundo em uma e não na outra as fazia parecer telas diferentes.
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: withOpacity(cores.onPrimary, 0.12),
    borderRadius: radius.lg,
  },
  /**
   * `flexShrink` com `numberOfLines={1}` na tela: nome comprido corta com reticências em vez de
   * empurrar a quantidade para fora. A quantidade é curta e não pode ser a que some — ela é metade
   * da informação clínica desta linha.
   */
  nomeMinimo: {
    ...typography.bodyLg,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: cores.onPrimary,
    flexShrink: 1,
  },
  quantidadeMinima: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    opacity: 0.85,
  },
  /**
   * A frase que acompanha a lista mínima, acima de três remédios.
   *
   * Diz o que fazer, e não o que há: o "quantos" já está no título e os nomes estão logo acima.
   */
  quantidade: {
    ...typography.headlineSm,
    color: cores.onPrimary,
    opacity: 0.85,
    textAlign: "center",
  },
  orientacao: {
    ...typography.bodyLg,
    color: cores.onPrimary,
    opacity: 0.75,
    lineHeight: 26,
    textAlign: "center",
  },
  /** A observação do tratamento na tela de uma dose. Ver `observacaoCompacta`. */
  observacao: {
    ...typography.bodySm,
    color: cores.onPrimary,
    opacity: 0.6,
    lineHeight: 22,
    textAlign: "center",
  },
  local: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  /**
   * O mesmo local, à esquerda e sem o respiro de cima.
   *
   * Mora **dentro** da coluna de texto (ver `textoDoItem`), e não como irmão do item: assim ele
   * alinha com o nome quer haja miniatura ou não, sem depender de um recuo fixo que quebraria no
   * remédio sem foto.
   */
  localEnxuto: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    opacity: 0.7,
  },
  localTexto: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },

  acoes: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    // Enxuto embaixo, com folga em cima: o rodapé é fixo, então cada dp aqui sai da lista. Mas o
    // respiro **acima** do botão fica — é ele que separa a resposta do último remédio, e sem essa
    // margem o botão lê como parte do cartão de cima em vez de ação da tela.
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  linhaDeResposta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  botaoTomei: {
    flex: 1,
    flexDirection: "row",
    /**
     * 48dp: o mínimo que o Android pede para alvo de toque, e o piso desta tela.
     *
     * Eram 56. Numa tela que precisa caber três remédios, os 8dp valem mais na lista do que na
     * altura de um botão que já é o maior elemento do rodapé — mas **não se desce daqui**: quem
     * responde recém-acordado erra a mira, e um alvo pequeno num alarme é defeito, não economia.
     */
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.onPrimary,
  },
  textoTomei: {
    ...typography.label,
    fontSize: 15,
    color: cores.primary,
  },
  botaoPulei: {
    flex: 1,
    flexDirection: "row",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
  },
  textoPulei: {
    ...typography.label,
    fontSize: 15,
    color: cores.onPrimary,
  },
  linhaDeSaidas: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoSilenciar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: withOpacity(cores.onPrimary, 0.35),
  },
  textoSilenciar: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.9,
  },
  botaoDepois: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textoDepois: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.8,
  },
  /**
   * O botão que já cumpriu seu papel: fica no lugar, apagado e sem ação.
   *
   * Some seria pior — a linha se reorganizaria debaixo do dedo de quem acabou de tocar, e o botão
   * vizinho mudaria de tamanho e de posição. Apagado, ele responde ao toque ("pronto, silenciei")
   * sem mover nada.
   */
  botaoInativo: {
    opacity: 0.45,
  },
}));
