/**
 * A paleta do Mapill.
 *
 * Azul marca o que é ação e o que é agora, então não pinta fundo de tela, cabeçalho nem barra de
 * abas: cor que está em toda parte deixa de significar alguma coisa.
 *
 * As razões de contraste anotadas aqui são contra a WCAG AA (4.5:1 para texto, 3:1 para elemento
 * gráfico). Elas dizem por que cada valor não pode subir nem descer.
 */
export const colors = {
  /** 6.4:1 sobre branco. */
  primary: "#0B5FD9",
  onPrimary: "#FFFFFF",
  /**
   * O azul mais claro do gradiente, e o pressionado de superfície azul. Carrega texto (selo do
   * diagnóstico, iniciais do avatar), então precisa dos 4.5:1: este dá 4.62:1, e clarear reprova.
   */
  primaryContainer: "#1F6FE8",
  onPrimaryContainer: "#FFFFFF",
  /** O azul diluído: fundo de bloco de apoio, chip selecionado leve, tinta de linha ativa. */
  primarySurface: "#EAF1FE",
  onPrimarySurface: "#0A3F8F",
  /**
   * O azul sobre superfície já escura: aba ativa, horário da próxima dose. No claro é igual a
   * `primary`; no escuro existe porque o `primary` de lá é navy de fundo, e some como tinta.
   */
  corDeDestaque: "#0B5FD9",
  /** Fundo de bloco que domina a tela, hoje só a faixa do calendário. No escuro é cinza. */
  superficieDeDestaque: "#0B5FD9",
  onSuperficieDeDestaque: "#FFFFFF",

  secondary: "#545F73",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D5E0F8",
  onSecondaryContainer: "#3D4757",

  /* O vocabulário é vermelho para o urgente, verde para o que está na hora, azul para o destaque
     comum, amarelo para o alerta. O terciário laranja do Material saiu por ser uma quinta cor num
     app que fala quatro, e manter o token convidaria a usá-lo de novo. */

  /**
   * O amarelo de atenção, e ele é a luz, não a tinta.
   *
   * Amarelo não serve como cor de texto: `#FFC107` dá 1.63:1 sobre branco. A saída é a do semáforo,
   * amarelo como lâmpada e o que se lê contra ele escuro, e é o que `warningSurface` faz.
   *
   * Três tokens porque os papéis são diferentes: `warning` é âmbar escuro para aviso sobre fundo
   * branco (4.92:1); `warningVivo` é o amarelo aceso, só em área pequena com texto escuro;
   * `warningSurface` é pastel porque cobre blocos inteiros, e amarelo cheio num painel agride.
   *
   * Amarelo e não laranja: com o erro em 0°, o laranja em 17° viraria grau da mesma cor, e o que
   * separa "acaba em cinco dias" de "acabou" é espécie, não intensidade.
   */
  warning: "#A16207",
  warningVivo: "#FFC107",
  onWarningVivo: "#231B00",
  warningSurface: "#FDF3C4",
  onWarningSurface: "#5C4A0F",

  /**
   * O vermelho de "isto falhou", usado como texto: 6.03:1 sobre branco, 5.27:1 sobre `errorSurface`.
   *
   * Os três vermelhos do app ficam no matiz 0° de propósito, para o app parecer ter um vermelho só
   * em intensidades diferentes, e não três parecidos.
   */
  error: "#C90000",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#8C0009",

  /**
   * O verde de "está certo agora", usado como texto ("TOMADA", a taxa de adesão).
   *
   * É o mais vivo que ainda passa nos dois fundos: 5.02:1 sobre branco e 4.50:1 sobre
   * `successSurface`, raspando no mínimo. Um passo acima (`#128A42`) cai para 3.97:1 e reprova.
   */
  success: "#11803E",
  onSuccess: "#FFFFFF",
  successContainer: "#A6F4C0",
  onSuccessContainer: "#04502A",

  /**
   * As versões vivas, só para elemento gráfico: ícone, barra, borda lateral, ponto de marcação.
   * A WCAG pede 3:1 para forma e 4.5:1 para texto, e é essa diferença que separa estes dois tokens
   * de `success` e `error`. Usar um no lugar do outro é como o defeito volta.
   *
   * O teto foi medido: o verde para em `#12963F` (3.45:1 na pior superfície) porque o verde grama
   * de catálogo (`#22C55E`) dá 2.28:1 e some até como ícone. O vermelho puro passa como forma
   * (3.50:1 na pior), mas reprova em texto, e é por isso que `error` existe separado.
   */
  successVivo: "#12963F",
  errorVivo: "#FF0000",

  /**
   * O vermelho de área preenchida, hoje o fundo do alerta de estoque.
   *
   * Terceiro tom porque aqui a exigência se inverte: quem precisa de contraste é o texto branco por
   * cima, e quanto mais vivo o fundo, pior. Este dá 8.55:1 com branco; o `errorVivo` daria 3.94:1 e
   * reprovaria, num card que carrega quatro linhas.
   */
  errorPreenchido: "#9E0008",
  /**
   * O que se lê **sobre** `errorPreenchido`.
   *
   * Nasceu tarde, e a falta dele era um defeito: o card de estoque baixo usava `onError`, que
   * significa "o que se lê sobre `error`" — outro fundo. Nos temas claros os dois calham de ser
   * branco e ninguém notava; no escuro, `error` é um vermelho **claro** (`#FF9A92`), então `onError`
   * é quase preto — e o texto do card saía a **1.51:1** contra o fundo, ilegível.
   *
   * Um token de preenchimento precisa do seu par de tinta. Sem ele, quem escreve a tela escolhe o
   * "on" mais parecido e o erro só aparece no tema onde as duas cores divergem.
   */
  onErrorPreenchido: "#FFFFFF",

  /**
   * As versões **diluídas** de sucesso e erro, para fundo de cartão numa lista.
   *
   * `successContainer` e `errorContainer` são os tons do Material para um chip ou um selo pequeno
   * — numa área grande eles gritam, e dois cartões saturados em sequência (a dose atrasada logo
   * acima da que é agora) anulam a hierarquia que a cor deveria criar. Estes são claros o
   * bastante para tingir sem chamar mais atenção que o texto que carregam.
   */
  successSurface: "#E8F6EC",
  // Matiz 0°, como os três vermelhos: em 6° ele puxava para o salmão e destoava do vermelho puro
  // que agora tinge o ícone e a faixa em cima dele.
  errorSurface: "#FDEAEA",
  /**
   * O que se lê **sobre** `errorSurface` — o par que faltava, como o `onErrorPreenchido`.
   *
   * Quem escrevia sobre essa superfície usava `error`, o vermelho de texto da tela. Os dois valem
   * enquanto o fundo da tela e a superfície tingida forem ambos claros; no tema escuro `error` é
   * um salmão (`#FF9A92`) e a superfície é clara, e o selo "OBRIGATÓRIO" saía a 1.76:1.
   *
   * Toda superfície precisa do seu "on". Sem ele, quem escreve a tela pega o token mais parecido,
   * e o erro só aparece no tema onde os dois divergem.
   */
  onErrorSurface: "#8C0009",

  /**
   * O fundo da tela, e a hierarquia de superfícies acima dele.
   *
   * `background` escureceu de `#F7F9FB` para `#F1F4F8` e ganhou um toque de azul. Com o fundo
   * quase branco, o cartão branco em cima dele dependia inteiramente da sombra para existir — e
   * sombra sutil some na luz do sol, que é onde metade do uso de um app de remédio acontece.
   * Agora o contraste entre fundo e cartão faz sozinho o trabalho que a sombra só reforça.
   */
  background: "#F1F4F8",
  onBackground: "#141719",
  surface: "#F1F4F8",
  surfaceBright: "#FFFFFF",
  /** O cartão. A superfície mais alta e mais clara — é onde o conteúdo mora. */
  surfaceContainerLowest: "#FFFFFF",
  /** Bloco de apoio *dentro* de um cartão: resumo, campo preenchido, chip não selecionado. */
  surfaceContainerLow: "#F5F7FA",
  surfaceContainer: "#E9EDF3",
  surfaceContainerHigh: "#DFE4EC",
  onSurface: "#141719",
  onSurfaceVariant: "#4A5160",

  /**
   * Texto de apoio e contorno.
   *
   * Dá 4.83:1 **sobre branco**, que é onde ele aparece como texto: quatro telas o usam assim (o
   * resumo da ficha, a finalidade no consentimento, o status dos termos), sempre dentro de cartão.
   *
   * ⚠️ Sobre o `background` da tela ele cai para 4.38:1 e **não** passa em AA para texto. Ali só
   * serve como contorno — para texto recuado direto sobre o fundo existe o `onSurfaceMuted`.
   */
  outline: "#6B7280",
  outlineVariant: "#CBD2DE",

  /**
   * O véu que cobre a tela quando um popup ou uma folha se abre.
   *
   * Existe como token porque a regra de "escurecer o que está atrás" **não sobrevive à troca de
   * tema sozinha**. O véu era `onSurface` a 40% — o cinza-azulado do texto, escolhido para não ser
   * um preto que a paleta não tem. Funciona em três temas e inverte no quarto: no escuro
   * `onSurface` é quase branco (`#E6E9EE`), então o "escurecedor" **clareava** o fundo, de
   * `#0F1319` para `#65696E`. Abrir um popup à noite acendia a tela atrás dele.
   *
   * Aqui a cor é dita para cada tema, e é o único jeito de a intenção ("o que está atrás recua")
   * sobreviver a uma paleta invertida — derivar de qualquer token de conteúdo repete o erro na
   * primeira inversão.
   */
  scrim: "rgba(20, 23, 25, 0.45)",
} as const;

export type ColorToken = keyof typeof colors;

/**
 * ## Como um estado se mostra, agora que a faixa lateral acabou
 *
 * Até aqui, "atrasada", "é agora", "atenção" e "erro" eram ditos por uma **barra colorida de 4px
 * na borda esquerda**. Ela saiu do app inteiro (7 lugares). O motivo não é gosto: a faixa grossa
 * é um enfeite que carrega significado — quem não repara nela não recebe a informação, e ela
 * empurra todo o conteúdo do bloco 4px para a direita, o que desalinha um cartão com estado do
 * cartão sem estado logo abaixo. Numa lista de doses isso lê como defeito de renderização.
 *
 * No lugar dela, três sinais que se somam e que **sobrevivem ao daltonismo** (o app tem público
 * idoso, e deuteranopia atinge 1 em 12 homens):
 *
 * 1. **Fundo tingido** — a superfície inteira recebe a cor diluída. Área grande, impossível de
 *    não ver, e não desloca nada.
 * 2. **Ícone** — desenhado, com a forma dizendo o que a cor diz.
 * 3. **Rótulo em texto** — "ATRASADA", "É AGORA". Já existia; agora ele herda a cor do estado em
 *    vez de ficar cinza.
 *
 * `estadoVisual` reúne o par fundo/tinta de cada estado, para que nenhuma tela precise escolher
 * de novo qual verde vai com qual verde.
 */
export function estadosVisuais(paleta: { readonly [K in ColorToken]: string }) {
  return {
    atencao: {
      fundo: paleta.warningSurface,
      tinta: paleta.warning,
      texto: paleta.onWarningSurface,
    },
    erro: {
      fundo: paleta.errorSurface,
      tinta: paleta.error,
      texto: paleta.onErrorContainer,
    },
    sucesso: {
      fundo: paleta.successSurface,
      tinta: paleta.success,
      texto: paleta.onSuccessContainer,
    },
    /**
     * O estado "isto é o próximo/o foco", que é azul porque é a cor da ação.
     *
     * `tinta` usa `corDeDestaque`, e não `primary`: este bloco tinge um fundo já claro
     * (`primarySurface`) no tema claro, mas no escuro o mesmo fundo é escuro — e ali `primary`
     * (o navy) mal se distingue dele. `corDeDestaque` é o azul pensado para continuar lendo como
     * tinta em qualquer um dos dois casos.
     */
    foco: {
      fundo: paleta.primarySurface,
      tinta: paleta.corDeDestaque,
      texto: paleta.onPrimarySurface,
    },
  } as const;
}

/**
 * Versão estática, para o código ainda não migrado para temas — ver a nota em `surfaceCard`.
 * Código migrado chama `estadosVisuais(cores)` dentro da receita de estilos.
 */
export const estadoVisual = estadosVisuais(colors);

export type EstadoVisual = keyof ReturnType<typeof estadosVisuais>;
