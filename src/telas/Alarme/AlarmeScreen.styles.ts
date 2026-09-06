
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
  /**
   * O que rola: cabeçalho no alto, remédio no centro.
   *
   * Era tudo centralizado junto (`justifyContent: center`), e o bloco de hora empurrava o remédio
   * para baixo. O cabeçalho situa — que horas são, o que é esta tela —, e uma vez lido não precisa
   * de destaque; o nome, a dose e a foto são o que se olha até responder. Fixando o cabeçalho no
   * alto, todo o espaço que sobra fica para eles.
   */
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  /** Compacto: ícone, rótulo e hora colados, para o bloco inteiro ocupar pouco no alto da tela. */
  cabecalho: {
    alignItems: "center",
    gap: spacing.xs,
  },
  /** Menor que os 80 de antes: o ícone situa a tela, mas quem manda no cabeçalho é a hora. */
  icone: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    // Branco translúcido sobre o azul: o ícone se destaca sem precisar de uma segunda cor.
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
  },
  /** Uma etiqueta acima da hora, e não um título: o que interessa é o número embaixo. */
  titulo: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.8,
    textAlign: "center",
  },
  /**
   * A hora em tamanho de relógio de cabeceira — 72, contra os 56 de antes.
   *
   * É o primeiro dado que se procura ao ser acordado por um alarme, antes até de saber qual remédio
   * é: a pergunta "que horas são?" vem antes de "o que eu tomo?". De olhos recém-abertos e sem
   * óculos, o tamanho é o que decide se ela é lida de relance ou soletrada.
   */
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
  /**
   * O remédio direto sobre o azul, sem cartão em volta.
   *
   * Era um cartão branco com sombra e 24 de padding — uma caixa dentro da tela, competindo por
   * atenção com o que ela contém. Nesta tela não há nada além do remédio para separar de nada: o
   * fundo azul inteiro já é o "cartão", e tirar a moldura deixa o nome e a foto ocuparem o espaço
   * que a borda tomava.
   */
  item: {
    alignItems: "center",
    gap: spacing.xs,
  },
  /**
   * A foto **inteira**, e num quadrado menor.
   *
   * Era `width: 100%` com altura fixa, o que forçava o recorte: a imagem preenchia a faixa e o que
   * não coubesse era cortado. Numa foto de caixa de remédio, o que sai da borda pode ser justamente
   * a dosagem impressa no canto — e o cadastro já obriga a enquadrar em quadrado, então recortar de
   * novo aqui descarta o que a pessoa escolheu manter.
   *
   * 132 é referência visual, não protagonismo: o que identifica o remédio é o nome logo abaixo, em
   * corpo grande. A foto confirma.
   */
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
  /** O nome quando são muitos: corpo de lista, não de título. Ver `MAXIMO_PARA_MOSTRAR_FOTO`. */
  nomeCompacto: {
    ...typography.headlineSm,
    color: cores.onPrimary,
    textAlign: "center",
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
  /**
   * Onde a caixa está guardada, no rodapé do bloco do remédio.
   *
   * A menor coisa da tela, e é assim que deve ser: às 3h da manhã o que precisa ser lido de longe é
   * o horário e o nome. Este é o detalhe que se procura depois de já ter levantado — e que, sem
   * estar aqui, obrigaria a abrir a tela de estoque no meio da noite.
   *
   * Com ícone e em linha própria porque a orientação de tomada logo acima também é texto miúdo e
   * claro: sem o marcador, "armário da cozinha" leria como continuação de "tomar em jejum".
   */
  local: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    // A opacidade no bloco, e não em cada filho: assim o ícone e o texto recuam juntos, em vez de o
    // marcador ficar mais forte que a palavra que ele marca.
    opacity: 0.7,
  },
  localTexto: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },

  /**
   * Os botões, com respiro entre eles.
   *
   * `gap` maior que o padrão de propósito: são ações que decidem um registro clínico, tomadas por
   * alguém que acabou de acordar. Encostados, o dedo erra — e errar aqui grava "pulei" no lugar de
   * "tomei", num histórico que o médico vai ler.
   */
  /** Fixas no rodapé, fora do scroll: responder ao alarme nunca pode depender de rolar a tela. */
  acoes: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  /** As duas respostas dividindo a largura: são a mesma decisão, vista dos dois lados. */
  linhaDeResposta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  /**
   * Ícone e rótulo lado a lado, na mesma linha.
   *
   * Empilhados, os botões pediam 88 de altura para caber os dois — espaço que a tela precisa para a
   * foto e o nome do remédio. Lado a lado, 56 bastam e o par ✓/✗ continua sendo o que se reconhece
   * antes de terminar de ler a palavra.
   *
   * ## Por que não verde e vermelho
   *
   * As cores afirmativas foram tentadas e saíram. No tema de daltonismo o "verde" do app é teal, e
   * distinguir duas ações opostas **pela cor** é justamente o que aquele tema existe para evitar —
   * quem não separa verde de vermelho ficaria com dois botões de tom parecido, um ao lado do outro,
   * numa tela onde errar grava "pulei" no lugar de "tomei".
   *
   * O que separa os dois aqui é o mesmo que os separa na agenda da Home: o **peso**. "Tomei" é o
   * botão cheio, "Pulei" é a superfície neutra — e o ícone confirma qual é qual sem depender de
   * matiz nenhum.
   */
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
  /**
   * A saída neutra: branco translúcido sobre o azul, a mesma linguagem do "Silenciar" logo abaixo.
   *
   * Sobre um fundo azul cheio não há "cinza claro" que funcione — o cinza do app foi feito para
   * superfícies claras. A translucidez faz o mesmo trabalho: presente, e claramente secundário ao
   * botão branco ao lado.
   */
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
  /**
   * Silenciar não decide nada — só corta o som —, então não pode parecer uma terceira resposta.
   *
   * Contorno em vez de fundo: com o mesmo translúcido do "Pulei" logo acima, os dois viravam
   * botões gêmeos, e um deles grava desfecho clínico enquanto o outro só cala o aparelho. O
   * contorno mantém o alvo visível no escuro e diz, pela forma, que ele é de outra natureza.
   */
  /** Silenciar e Adiar dividem a largura: nenhum registra desfecho, e juntos custam uma altura só. */
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
  /**
   * A saída discreta.
   *
   * Não usa mais o `Button variant="text"`: aquele pinta o rótulo com a cor de texto padrão do app
   * — cinza escuro —, e sobre o azul cheio desta tela o contraste ficava ilegível. Aqui o branco
   * translúcido resolve o contraste e mantém a discrição que a variante buscava.
   */
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
  /** Fica no lugar do botão de silenciar, para a lista de ações não pular quando ele some. */
  silenciadoAviso: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    textAlign: "center",
    opacity: 0.85,
    paddingVertical: spacing.md,
  },
}));
