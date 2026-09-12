
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  cabecalho: {
    alignItems: "center",
    gap: spacing.xs,
  },
  icone: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
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
    gap: spacing.lg,
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
   * O item da lista enxuta: alinhado à esquerda, com uma linha de separação acima.
   *
   * Centralizado como o de uma dose, três remédios viravam três blocos flutuando no meio da tela,
   * sem eixo comum para o olho seguir. À esquerda eles se leem como lista — que é o que são.
   */
  itemEnxuto: {
    alignItems: "stretch",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  /** Miniatura à esquerda, texto à direita — a forma de uma linha de lista. */
  linhaDoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  /**
   * 44dp: o tamanho em que a caixa ainda se reconhece pela cor e pela forma, sem tomar a linha.
   *
   * Os 132dp da tela de uma dose não cabem aqui — três deles empilhados não deixam espaço para mais
   * nada, e a tela vista em 12/09 já estava cheia sem foto nenhuma.
   *
   * `alignSelf: "flex-start"` alinha a miniatura com o **nome**, e não com o centro do bloco: com a
   * orientação de tomada dentro do item, a coluna de texto passou a ter até quatro linhas, e uma
   * foto centrada nelas flutuaria longe do que ela identifica.
   */
  miniatura: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignSelf: "flex-start",
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
    ...typography.bodyMd,
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
    ...typography.bodySm,
    color: cores.onPrimary,
    opacity: 0.75,
    lineHeight: 18,
    textAlign: "left",
  },
  /** O local na lista, um degrau abaixo do `localTexto` da tela de uma dose. */
  localCompacto: {
    ...typography.bodySm,
    color: cores.onPrimary,
  },
  /**
   * A frase que substitui a lista acima de três remédios.
   *
   * Diz o que fazer, e não o que há: o "quantos" já está no título, e repetir o número aqui seria
   * dizer duas vezes a única coisa que a tela sabe antes de a pessoa tocar.
   */
  resumo: {
    ...typography.bodyLg,
    color: cores.onPrimary,
    opacity: 0.85,
    textAlign: "center",
    lineHeight: 26,
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
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  linhaDeResposta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  botaoTomei: {
    flex: 1,
    flexDirection: "row",
    minHeight: 56,
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
  silenciadoAviso: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    textAlign: "center",
    opacity: 0.85,
    paddingVertical: spacing.md,
  },
}));
