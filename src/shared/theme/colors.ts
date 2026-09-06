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
   * O amarelo de atenção — a dica, o lembrete de recontagem, a permissão que falta.
   *
   * ## Por que amarelo, e não laranja
   *
   * O laranja seria o vizinho natural do vermelho, e é justamente o problema: com o erro em 0° e o
   * alerta em 17°, os dois virariam graus da mesma cor, e o que distingue "acaba em cinco dias" de
   * "acabou" é uma diferença de **espécie**, não de intensidade. Em 35° o amarelo se separa do
   * vermelho e continua sendo a cor que todo mundo lê como aviso.
   *
   * Amarelo puro (`#FFE600`) não serve: dá 1.6:1 sobre branco, invisível como texto e como ícone.
   * `#A16207` é o dourado mais claro que ainda passa nos dois papéis — 4.92:1 sobre branco, 4.70:1
   * sobre o próprio `warningSurface`.
   *
   * ## O amarelo é a **luz**, não a tinta
   *
   * Três tentativas antes desta, e o erro era sempre o mesmo: tratar o amarelo como cor de texto.
   * Ele não serve para isso — `#FFC107` dá **1.63:1** sobre branco, invisível. Escurecê-lo até
   * passar produz marrom, que foi o `#7C3A06` original; fugir do marrom com cinza-quente produz o
   * `#4A4436`, que deixou o bloco sem vida.
   *
   * O semáforo real resolve isso há um século: o amarelo é a **lâmpada acesa**, e o que se lê
   * contra ele é escuro. Então `warningSurface` passou a ser o amarelo de verdade (`#FFC107`), e o
   * texto sobre ele é quase-preto — **10.68:1**, o maior contraste de qualquer estado do app.
   *
   * `warning` continua âmbar escuro porque tem outro papel: é a cor do aviso quando ele aparece
   * **sobre fundo branco**, como texto ou ícone solto, onde o amarelo vivo sumiria.
   *
   * ## Três tokens, e não dois
   *
   * `warningVivo` é o amarelo aceso, e só serve onde a área é **pequena e o texto é escuro** — o
   * selo "acaba em 5 dias", uma faixa, um ponto. `warningSurface` continua pastel porque cobre
   * blocos inteiros (a `Dica`, o painel de permissões, o lembrete de recontagem): amarelo cheio num
   * painel de quatro linhas não avisa, agride.
   */
  warning: "#A16207",
  warningVivo: "#FFC107",
  onWarningVivo: "#231B00",
  warningSurface: "#FDF3C4",
  onWarningSurface: "#5C4A0F",

  /**
   * O vermelho de "isto falhou" — a dose atrasada, o estoque zerado, o botão de excluir.
   *
   * Vermelho puro escurecido: matiz 0°, o mesmo do `#FF0000` do `errorVivo`, só que fechado o
   * bastante para ser **lido**. O `#C4141C` anterior ficava em 357° — do lado do roxo — e era isso
   * que o fazia parecer vinho ou rosa escuro.
   *
   * Os três vermelhos do app compartilham o matiz 0° de propósito: o ícone (`errorVivo`), o cartão
   * (`errorPreenchido`) e a palavra (este) são a mesma cor em intensidades diferentes, e é o que
   * faz o app parecer ter um vermelho só em vez de três parecidos.
   *
   * 6.03:1 sobre branco e 5.27:1 sobre o `errorSurface` — folga sobre os 4.5:1 exigidos de texto
   * ("Estoque zerado", "Excluir").
   */
  error: "#C90000",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#8C0009",

  /**
   * O verde de "está certo agora" — a dose dentro da janela do horário, o compromisso de hoje.
   *
   * `#11803E` no lugar do `#0F7038`, que era escuro a ponto de parecer verde-garrafa num ícone de
   * 20px.
   *
   * É o mais vivo que ainda passa nos dois fundos em que a cor aparece como **texto** (o rótulo
   * "TOMADA", a taxa de adesão): 5.02:1 sobre branco e 4.50:1 sobre o próprio `successSurface` —
   * este último raspando no mínimo da WCAG AA. `#128A42`, um passo acima, cai para 3.97:1 e
   * reprovaria justamente no fundo onde o rótulo verde mais aparece.
   */
  success: "#11803E",
  onSuccess: "#FFFFFF",
  successContainer: "#A6F4C0",
  onSuccessContainer: "#04502A",

  /**
   * As versões **vivas** de sucesso e erro — verde grama e vermelho fogo, cor de semáforo.
   *
   * ## Por que são tokens separados
   *
   * `success` e `error` são usados como **texto** ("TOMADA", "Estoque zerado", a taxa de adesão), e
   * texto precisa de 4.5:1 na WCAG AA. Essa exigência é o que empurra qualquer verde vivo de volta
   * para o escuro: verde grama dá 2.95:1 sobre a superfície tingida, ilegível.
   *
   * Mas a exigência é do texto, não da cor. Ícone, barra de gráfico, borda lateral e ponto de
   * marcação são **elementos gráficos**, e para eles a WCAG pede 3:1.
   *
   * Então a divisão é por papel: o vivo onde o olho bate primeiro e a cor é a informação; o escuro
   * onde a cor acompanha uma palavra que precisa ser lida. Trocar um pelo outro é como o defeito
   * volta.
   *
   * ## Por que não são ainda mais vivos
   *
   * O teto foi medido, e não escolhido. `#22C55E` (o verde grama de catálogo) dá **2.28:1** sobre
   * branco: some como ícone, não só como texto. `#16A34A` passa sobre branco (3.30:1) mas cai para
   * 2.95:1 nas superfícies tingidas, onde metade dos ícones vive — e um ícone que some no fundo
   * verde-claro do próprio card é pior que um ícone escuro.
   *
   * O vermelho é o **puro** (`#FF0000`), pedido do Gabriel. Como forma ele passa em toda superfície
   * do app (4.00:1 sobre branco, 3.50:1 na pior delas, contra os 3:1 exigidos) — mas **só** como
   * forma: em texto ele dá 4.00:1 e reprova, que é a razão de o `error` existir separado.
   *
   * O verde para em `#12963F` (3.45:1 na pior superfície). Verde grama de catálogo (`#22C55E`) dá
   * 2.28:1 e some até como ícone — o olho perde a forma no fundo, não só a leitura.
   */
  successVivo: "#12963F",
  errorVivo: "#FF0000",

  /**
   * O vermelho de **área preenchida** — o fundo do alerta de estoque.
   *
   * Terceiro tom porque a exigência aqui se inverte: quando a cor é fundo de card, quem precisa de
   * contraste é o texto branco por cima, e aí quanto mais vivo o vermelho, pior. `errorVivo` como
   * fundo daria 3.94:1 no branco e reprovaria — o mesmo tom que funciona num ícone de 20px falha
   * numa área que carrega três linhas de texto.
   *
   * ## Por que é escuro, e não o `#FF0000` exato
   *
   * Escolhido no aparelho: é o vermelho que o tema de alto contraste já usava, e no card de estoque
   * da Home ele ficou melhor que qualquer um dos claros que passaram por aqui. Faz sentido — numa
   * área grande, o vermelho aceso vibra e cansa, enquanto o fechado lê como sangue.
   *
   * O contraste confirma: 8.55:1 com o texto branco por cima, contra 4.81:1 do `#E60000` e 4.00:1
   * do vermelho puro (que reprovaria). Este card carrega quatro linhas brancas, incluindo o nome do
   * medicamento e o botão.
   *
   * Único dos três fora do matiz 0 (fica em 357°), e aqui isso não é defeito: em área grande e
   * escura o desvio não se percebe como rosa, que era o problema do `#C4141C` em texto pequeno.
   */
  errorPreenchido: "#9E0008",

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
