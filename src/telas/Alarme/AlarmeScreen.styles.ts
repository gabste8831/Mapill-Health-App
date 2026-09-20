
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Azul cheio, e nao o cinza do resto do app: e a unica tela que nao parece o Mapill, de
   * proposito. Ela irrompe sobre o bloqueio, no escuro, e precisa ser reconhecida em meio segundo.
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

  // Fixo no topo, fora da rolagem, por isso traz o proprio recuo lateral: sem ele o titulo
  // encostaria na borda enquanto a lista abaixo continua recuada.
  cabecalho: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    // Separa a hora do primeiro cartao: o cabecalho precisa se ler como bloco a parte da lista.
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

  // `flex: 1` e o que centra o remedio no espaco que sobra, em vez de deixa-lo logo abaixo da hora.
  lista: {
    flex: 1,
    justifyContent: "center",
    // `md` e nao `lg`: com o fundo do cartao delimitando cada item, a separacao ja esta feita, e o
    // espaco que sobra e o que falta para o terceiro remedio caber na tela.
    gap: spacing.md,
  },
  // A dose unica, no mesmo cartao das outras formas: sao a mesma tela com mais ou menos remedios,
  // nao tres telas. Aqui o conteudo fica centrado, porque nao ha lista a alinhar.
  item: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: withOpacity(cores.onPrimary, 0.12),
    borderRadius: radius.lg,
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
  // Alinhado a esquerda: centralizados, tres remedios viram tres blocos flutuando sem eixo comum
  // para o olho seguir. Sem linha divisoria, porque o fundo do cartao ja delimita cada um.
  itemEnxuto: {
    alignItems: "stretch",
    // Simetrico: metade em cima e metade embaixo somava espaco desigual com o cabecalho.
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    // Branco a 12% sobre o azul, e nao cor fixa: acompanha o fundo em vez de brigar com ele, e
    // continua valendo se o tom da tela mudar.
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
   * `center` para a foto acompanhar o meio do par nome/dose - são duas linhas de altura conhecida,
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
  // A faixa de baixo, na largura inteira: estas linhas sao as que mais crescem, e presas a coluna
  // ao lado da foto quebravam cedo demais.
  detalhesDoItem: {
    gap: 2,
  },
  /**
   * 64dp: grande para a caixa se reconhecer pela cor e pela forma, sem tomar a linha. Os 132 da
   * tela de uma dose nao cabem tres vezes, e a 44 a foto virava selo que nao se le de madrugada.
   *
   * Centrada na altura, e nao alinhada ao nome: com tres ou quatro linhas de texto ao lado, presa
   * ao topo ela deixava um vao embaixo e a linha ficava com dois eixos.
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
  // Menor que na tela de uma dose: com tres remedios, tres titulos grandes disputam a tela e
  // nenhum se destaca. Aqui o nome precisa ser lido, nao anunciado.
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
   * A orientacao de tomada e regra, nao estetica: quem toma em jejum precisa saber no instante em
   * que levanta. Caber e problema de escala, e se resolve no corpo do texto - com entrelinha
   * apertada, duas linhas aqui somam menos que uma na versao de uma dose so.
   */
  orientacaoCompacta: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    opacity: 0.8,
    lineHeight: 20,
    textAlign: "left",
  },
  /** As etiquetas quebram linha quando são muitas - seis orientações não cabem numa só. */
  etiquetas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginVertical: 2,
  },
  // Mais clara que o cartao, para se destacar dentro dele: e a regra da tomada, e como texto
  // corrido ela se lia igual a observacao livre logo abaixo.
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
  // Mais apagada que a orientacao: e sobre o tratamento como um todo, nao sobre como engolir esta
  // dose, e com o mesmo peso competiria com a informacao que decide a tomada.
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
   * A lista minima, de quatro remedios em diante: so nome e quantidade.
   *
   * O terceiro degrau de escala da tela corta o que nao decide se a pessoa levanta - foto,
   * orientacao e local. O nome fica porque responde "e o da pressao ou o do sono?".
   *
   * Centrada na altura como as outras formas: presa ao topo, a lista deixava um vao embaixo que so
   * aparecia aqui, e as tres formas passavam a se comportar diferente.
   */
  listaMinima: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
  },
  // Lado a lado, e nao empilhados: empilhado cada remedio vira dois niveis e a lista dobra de
  // altura, voltando a rolar, que e o que este degrau existe para evitar.
  itemMinimo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.sm,
    // O mesmo cartao das outras formas: um fundo numa e nao na outra as fazia parecer telas
    // diferentes.
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: withOpacity(cores.onPrimary, 0.12),
    borderRadius: radius.lg,
  },
  // Nome comprido corta com reticencias em vez de empurrar a quantidade para fora: ela e curta e e
  // metade da informacao clinica desta linha.
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
  // Dentro da coluna de texto, e nao como irmao do item: assim alinha com o nome havendo miniatura
  // ou nao, sem um recuo fixo que quebraria no remedio sem foto.
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
    // respiro **acima** do botão fica - é ele que separa a resposta do último remédio, e sem essa
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
    // 48dp e o minimo que o Android pede para alvo de toque, e o piso desta tela: nao se desce
    // daqui, porque quem responde recem-acordado erra a mira.
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
  // O botao que ja cumpriu seu papel fica no lugar, apagado: some faria a linha se reorganizar
  // debaixo do dedo de quem acabou de tocar.
  botaoInativo: {
    opacity: 0.45,
  },
}));
