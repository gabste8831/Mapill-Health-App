/**
 * A paleta do Mapill.
 *
 * ## O azul
 *
 * Azul é a cor focal do app: ele marca o que é ação e o que é agora. Por isso ele **não** pinta
 * fundo de tela, cabeçalho nem barra de abas — cor que está em toda parte deixa de significar
 * alguma coisa, e o azul precisa continuar querendo dizer "toque aqui".
 *
 * `primary` foi para `#0B5FD9`: um degrau mais claro e mais saturado que o `#0057BF` antigo, que
 * puxava para o marinho corporativo. Continua dando 6.4:1 sobre branco (AA folgado para texto,
 * AAA para texto grande), então segue válido como cor de rótulo, não só de fundo.
 */
export const colors = {
  primary: "#0B5FD9",
  onPrimary: "#FFFFFF",
  /** O azul mais claro do gradiente do card-herói, e o estado pressionado de superfície azul. */
  primaryContainer: "#2B7BF5",
  onPrimaryContainer: "#FFFFFF",
  /**
   * O azul **diluído**: fundo de bloco de apoio, chip selecionado leve, tinta de linha ativa.
   * É o que permite usar a cor da marca numa área grande sem que ela grite.
   */
  primarySurface: "#EAF1FE",
  onPrimarySurface: "#0A3F8F",
  /**
   * O azul quando ele precisa **se destacar sobre uma superfície já escura** — a aba ativa da
   * barra de navegação, o horário da próxima dose. No claro é idêntico a `primary`. No escuro
   * existe porque `primary` de lá é o navy escurecido (pensado para fundo de bloco, não para
   * ler como tinta): usá-lo como cor de ícone/texto sobre uma barra que já é escura o deixava
   * quase invisível — o mesmo problema, em miniatura, que motivou escurecer `primary`.
   */
  corDeDestaque: "#0B5FD9",
  /**
   * O fundo de um bloco que domina boa parte da tela sozinho — hoje só a faixa do calendário.
   * No claro é `primary`, igual sempre foi. No escuro é cinza: pedido do Gabriel depois de ver o
   * tema escuro de verdade — um bloco tão grande pintado do azul do tema competia com o resto da
   * paleta escura em vez de se somar a ela, e o calendário é tela onde essa faixa ocupa a maior
   * fatia da tela de qualquer lugar do app.
   */
  superficieDeDestaque: "#0B5FD9",
  onSuperficieDeDestaque: "#FFFFFF",

  secondary: "#545F73",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D5E0F8",
  onSecondaryContainer: "#3D4757",

  tertiary: "#994200",
  tertiaryContainer: "#C05400",
  onTertiaryContainer: "#FFFBFF",

  /**
   * O âmbar de atenção — a dica, o lembrete de recontagem, a permissão que falta.
   *
   * Saiu do `#FFE600` (amarelo puro) para `#B45309`. O amarelo puro é invisível como texto e como
   * ícone: 1.6:1 sobre branco, ou seja, reprovado em qualquer critério. Ele só funcionava porque
   * era usado como *faixa*, e a faixa acabou (ver `stateAccent`). Como agora a cor precisa
   * aparecer em ícone e em rótulo, ela tem que ser legível: este âmbar dá 4.8:1 sobre branco e
   * 4.6:1 sobre o próprio `warningSurface`.
   */
  warning: "#B45309",
  warningSurface: "#FEF6E7",
  onWarningSurface: "#7C3A06",

  error: "#C4141C",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#8C0009",

  /** O verde de "está certo agora" — a dose dentro da janela do horário. */
  success: "#0F7038",
  onSuccess: "#FFFFFF",
  successContainer: "#A6F4C0",
  onSuccessContainer: "#04502A",

  /**
   * As versões **diluídas** de sucesso e erro, para fundo de cartão numa lista.
   *
   * `successContainer` e `errorContainer` são os tons do Material para um chip ou um selo pequeno
   * — numa área grande eles gritam, e dois cartões saturados em sequência (a dose atrasada logo
   * acima da que é agora) anulam a hierarquia que a cor deveria criar. Estes são claros o
   * bastante para tingir sem chamar mais atenção que o texto que carregam.
   */
  successSurface: "#E8F6EC",
  errorSurface: "#FDECEA",

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
   * Texto de apoio e contorno. Dá 5.1:1 sobre branco e 4.8:1 sobre o fundo da tela — ele não é só
   * cor de borda: quatro telas o usam como **texto** (o resumo da ficha, a finalidade no
   * consentimento, o status dos termos), e aí precisa passar como texto.
   */
  outline: "#6B7280",
  outlineVariant: "#CBD2DE",
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
