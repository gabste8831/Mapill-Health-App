import type { Tema } from "./tipos";

/**
 * # Tema escuro
 *
 * Um app de remédio é usado no escuro com frequência real: a dose das 22h, o alarme de madrugada.
 *
 * As quatro regras que qualquer cor nova aqui precisa seguir:
 *
 * 1. Nada de preto puro. Preto ao lado de texto branco produz halo em OLED.
 * 2. Elevação por luz, não por sombra: a superfície mais alta é a mais clara, porque sombra escura
 *    sobre fundo escuro é invisível.
 * 3. Cor saturada se clareia, não se escurece: no escuro, cor forte se lê pelo brilho.
 * 4. Superfície de estado fica tingida, não pastel: o pastel do tema claro viraria bloco branco.
 */
export const temaEscuro: Tema = {
  id: "escuro",
  nome: "Escuro",
  descricao: "Fundo escuro, para uso à noite e com pouca luz.",
  esquema: "escuro",
  cores: {
    /**
     * O mesmo azul do tema padrão: a marca não muda de cor porque anoiteceu. Fica no matiz 216° do
     * app, dá 3.24:1 contra o fundo (acima dos 3:1 de forma) e 5.75:1 com texto branco por cima.
     */
    primary: "#0B5FD9",
    onPrimary: "#FFFFFF",
    primaryContainer: "#0A4CAE",
    onPrimaryContainer: "#FFFFFF",
    primarySurface: "#16233A",
    onPrimarySurface: "#B9D5FF",
    /**
     * O azul claro que `primary` era antes de escurecer — 8.1:1 de contraste contra o fundo.
     * Reservado para onde a cor precisa **ler como tinta** sobre uma superfície já escura (a aba
     * ativa da barra de navegação, o horário em destaque de uma dose): ali o navy de `primary`
     * quase não se distingue do resto da paleta escura.
     */
    corDeDestaque: "#7FB2FF",
    /**
     * Cinza, e não azul, para o bloco que domina a tela sozinho — hoje só a faixa do calendário.
     * Pedido do Gabriel depois de ver o tema escuro de verdade: um bloco tão grande no azul do
     * tema competia com o resto da paleta escura em vez de se somar a ela.
     *
     * É o **mesmo `surfaceContainer`** das fichas de filtro não selecionadas, logo abaixo da
     * grade. Já foi `surfaceContainerHigh`, um degrau acima, e a diferença de um degrau entre dois
     * blocos vizinhos não lê como hierarquia — lê como desalinho, duas superfícies quase iguais
     * sem motivo aparente para não serem iguais. Sendo a mesma cor, a faixa e as fichas passam a
     * ser um bloco só de "controles do calendário".
     */
    superficieDeDestaque: "#2A323D",
    onSuperficieDeDestaque: "#E6E9EE",

    secondary: "#B9C4DA",
    onSecondary: "#232D3F",
    secondaryContainer: "#2C374A",
    onSecondaryContainer: "#D6E0F5",


    /**
     * A superfície de aviso é **clara**, a mesma do tema padrão — e não um marrom escuro.
     *
     * Já foi `#2B2718`, seguindo a regra geral do tema ("superfícies de estado ficam tingidas, não
     * pastel"). A regra vale para superfície que cobre área grande; falha para **bloco de aviso**,
     * que é o caso do painel de permissões e da `Dica`. Ali o fundo tem luminância 0.02: um
     * retângulo praticamente preto dentro de um popup escuro, sem a cor que faz um aviso ser
     * reconhecido como aviso antes de ser lido.
     *
     * O amarelo é a **lâmpada acesa** (ver `colors.ts`), e uma lâmpada apagada não avisa nada. Aqui
     * ela acende igual, com o texto escuro por cima: 7.70:1, o mesmo par do tema claro.
     */
    warning: "#F5B54A",
    warningSurface: "#FDF3C4",
    onWarningSurface: "#5C4A0F",
    /**
     * O amarelo aceso vale igual no escuro — é a mesma lâmpada, e o texto escuro contra ela
     * continua sendo o que se lê. Um selo pequeno em amarelo cheio não incomoda à noite; o que
     * incomodaria é um bloco inteiro, e esse continua com a superfície escura acima.
     */
    warningVivo: "#FFC107",
    onWarningVivo: "#231B00",

    error: "#FF9A92",
    onError: "#5C0006",
    errorContainer: "#8C1017",
    onErrorContainer: "#FFDAD7",

    success: "#68DE94",
    onSuccess: "#00391A",
    successContainer: "#0B5730",
    onSuccessContainer: "#A6F4C0",

    successSurface: "#12281C",
    /**
     * Clara como no padrão, pelo mesmo motivo do `warningSurface` acima: ela tinge o bloco de
     * permissão faltando dentro do popup de lembrete, e em `#2E1618` (luminância 0.01) aquilo era
     * um retângulo preto — a cor que deveria dizer "isto impede o alarme de tocar" não chegava.
     *
     * ⚠️ Quem escreve sobre ela precisa de tinta **escura**: o `error` deste tema é claro
     * (`#FF9A92`) e daria 1.4:1 aqui. O `PainelDePermissoes` usa `error`, então a linha de texto
     * dele passou a `onErrorContainerEscuro` — ver o uso no componente.
     */
    errorSurface: "#FDEAEA",
    /**
     * Escura, porque a superficie dela ficou clara.
     *
     * E o unico "on" deste tema que nao segue a regra de "tinta clara sobre fundo escuro": aqui a
     * superficie e uma ilha clara dentro da tela escura, e quem escreve nela obedece a ilha.
     */
    onErrorSurface: "#8C0009",

    /**
     * No escuro, "vivo" é **mais saturado**, e não mais escuro.
     *
     * Aqui a cor já é clara por necessidade — ela vive sobre fundo escuro. O que faltava ao
     * `#68DE94` e ao `#FF9A92` não era luz, era saturação: os dois são pastéis, quase menta e
     * salmão. Estes têm o mesmo brilho com o croma que dá o tom de semáforo (9.7:1 e 6.7:1 sobre o
     * fundo, folgados nos 3:1 que a forma pede).
     */
    successVivo: "#2FD66E",
    errorVivo: "#FF7063",
    /**
     * No escuro o alerta preenchido é um vermelho **escuro** com texto claro, e não o contrário.
     *
     * Um bloco de vermelho vivo aceso numa tela escura é o que se olha à noite e dói — e este card
     * aparece na Home, que é a primeira tela do app. `#8C1017` (o `errorContainer` do tema) carrega
     * o mesmo sinal com o brilho que o resto da interface tem.
     */
    errorPreenchido: "#8C1017",
    /**
     * Branco, e nao o `onError` deste tema.
     *
     * Aqui os dois divergem: `error` e claro (`#FF9A92`), entao `onError` e quase preto — e era
     * ele que o card de estoque baixo usava, saindo a 1.51:1 contra o proprio fundo. Sobre o
     * vermelho escuro do preenchimento quem se le e o branco: 9.54:1.
     */
    onErrorPreenchido: "#FFFFFF",

    background: "#0F1319",
    onBackground: "#E6E9EE",
    surface: "#0F1319",
    surfaceBright: "#262D38",
    /** A superfície mais alta é a mais clara: no escuro, elevação se lê por luz. */
    surfaceContainerLowest: "#191F27",
    surfaceContainerLow: "#222933",
    surfaceContainer: "#2A323D",
    surfaceContainerHigh: "#343D4A",
    onSurface: "#E6E9EE",
    onSurfaceVariant: "#AEB6C4",

    outline: "#8A93A3",
    outlineVariant: "#3C4553",
    /**
     * Mais opaco que no claro, e preto de verdade.
     *
     * Sobre um fundo que ja e escuro, um veu translucido quase nao muda nada — e o que separa o
     * popup do resto da tela e justamente esse recuo. 65% de preto leva o fundo de `#0F1319` para
     * quase `#000`, e a folha clara por cima ganha o contraste que no tema claro vem de graca.
     */
    scrim: "rgba(0, 0, 0, 0.65)",
  },
  ajustes: {
    contornarSuperficies: false,
    reforcarFormaEIcone: false,
    textoDeApoioMaisForte: false,
  },
};
