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
   * O amarelo de atencao e a luz, nao a tinta: `#FFC107` da 1.63:1 sobre branco e nao serve como
   * texto.
   *
   * Tres tokens porque os papeis diferem: `warning` e ambar escuro para texto sobre branco
   * (4.92:1), `warningVivo` e o amarelo aceso so em area pequena com texto escuro, e
   * `warningSurface` e pastel porque cobre blocos inteiros.
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
   * As versoes vivas, so para elemento grafico: icone, barra, borda, ponto de marcacao.
   *
   * A WCAG pede 3:1 para forma e 4.5:1 para texto, e e essa diferenca que as separa de `success` e
   * `error`. Usar uma no lugar da outra e como o defeito volta. O teto foi medido: o verde para em
   * 3.45:1 na pior superficie, e o vermelho puro passa como forma mas reprova como texto.
   */
  successVivo: "#12963F",
  errorVivo: "#FF0000",

  /**
   * O vermelho de area preenchida, hoje o fundo do alerta de estoque.
   *
   * Aqui a exigencia se inverte: quem precisa de contraste e o texto branco por cima, e quanto mais
   * vivo o fundo, pior. Este da 8.55:1 com branco; o `errorVivo` daria 3.94:1 e reprovaria.
   */
  errorPreenchido: "#9E0008",
  /**
   * O que se le sobre `errorPreenchido`.
   *
   * Todo token de preenchimento precisa do seu par de tinta. Sem ele quem escreve a tela pega o
   * "on" mais parecido, e o erro so aparece no tema onde as duas cores divergem: usando `onError`,
   * o texto saia a 1.51:1 no escuro.
   */
  onErrorPreenchido: "#FFFFFF",

  /**
   * As versoes diluidas, para fundo de cartao numa lista.
   *
   * Os `container` do Material sao tons de chip ou selo pequeno: numa area grande eles gritam, e
   * dois cartoes saturados em sequencia anulam a hierarquia que a cor deveria criar.
   */
  successSurface: "#E8F6EC",
  // Matiz 0, como os tres vermelhos: em 6 ele puxava para o salmao.
  errorSurface: "#FDEAEA",
  /** O par de tinta da superficie: com `error` no escuro, o selo saia a 1.76:1. */
  onErrorSurface: "#8C0009",

  /**
   * O fundo da tela, e a hierarquia de superficies acima dele.
   *
   * Nao e quase branco de proposito: assim o cartao branco em cima nao depende so da sombra para
   * existir, e sombra sutil some na luz do sol, que e onde metade do uso acontece.
   */
  background: "#F1F4F8",
  onBackground: "#141719",
  surface: "#F1F4F8",
  surfaceBright: "#FFFFFF",
  /** O cartão. A superfície mais alta e mais clara - é onde o conteúdo mora. */
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
   * 4.83:1 sobre branco, que e onde ele aparece como texto, sempre dentro de cartao. Sobre o
   * `background` da tela cai para 4.38:1 e nao passa em AA: ali so serve como contorno, e para
   * texto direto sobre o fundo existe o `onSurfaceMuted`.
   */
  outline: "#6B7280",
  outlineVariant: "#CBD2DE",

  /**
   * O veu que cobre a tela quando um popup abre.
   *
   * Token proprio, e nao `onSurface` com opacidade, porque a intencao de "o que esta atras recua"
   * nao sobrevive a uma paleta invertida: no escuro aquele token e quase branco, e o escurecedor
   * clareava o fundo. Abrir um popup a noite acendia a tela atras dele.
   */
  scrim: "rgba(20, 23, 25, 0.45)",
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Como um estado se mostra.
 *
 * Tres sinais que se somam e sobrevivem ao daltonismo, num app de publico idoso onde a
 * deuteranopia atinge 1 em 12 homens: fundo tingido na superficie inteira, icone com a forma
 * dizendo o que a cor diz, e rotulo em texto herdando a cor do estado.
 *
 * `estadoVisual` reune o par fundo/tinta de cada estado, para que nenhuma tela precise escolher
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
     * (`primarySurface`) no tema claro, mas no escuro o mesmo fundo é escuro - e ali `primary`
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
 * Versão estática, para o código ainda não migrado para temas - ver a nota em `surfaceCard`.
 * Código migrado chama `estadosVisuais(cores)` dentro da receita de estilos.
 */
export const estadoVisual = estadosVisuais(colors);

export type EstadoVisual = keyof ReturnType<typeof estadosVisuais>;
