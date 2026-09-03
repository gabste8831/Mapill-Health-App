import type { Tema } from "./tipos";

/**
 * # Tema escuro
 *
 * ## Para que serve neste app
 *
 * Não é preferência estética: um app de remédio é usado **no escuro** com frequência real — a dose
 * das 22h, o alarme de madrugada, a conferência antes de dormir. Tela branca cheia nessas horas
 * ofusca, e a pessoa que acabou de acordar precisa ler um horário, não se recuperar do clarão.
 *
 * ## As regras que este tema segue
 *
 * **Nada de preto puro.** O fundo é `#0F1319`, um cinza-azulado escuro. Preto absoluto ao lado de
 * texto branco produz halo (o texto parece vibrar) em telas OLED, e é cansativo justamente na
 * leitura longa que a ficha de saúde exige.
 *
 * **Elevação por luz, não por sombra.** No claro, um cartão se separa do fundo por uma sombra. No
 * escuro isso não funciona — sombra escura sobre fundo escuro é invisível. Aqui a superfície mais
 * alta é a **mais clara**: fundo `#0F1319` → cartão `#191F27` → bloco interno `#222933`. É a mesma
 * hierarquia, com o sinal invertido.
 *
 * **Cores saturadas são clareadas, não escurecidas.** O azul `#0B5FD9` do tema claro dá 2.1:1
 * contra o fundo escuro — sumiria. Ele vira `#7FB2FF`: mesma família, luminosidade alta o
 * bastante para 8.1:1. A regra vale para todos os estados: no escuro, cor forte se lê pelo brilho.
 *
 * **Superfícies de estado ficam tingidas, não pastel.** `errorSurface` claro (`#FDECEA`) viraria
 * um bloco branco no escuro. Aqui ele é o próprio vermelho rebaixado até virar fundo — mantém a
 * leitura de "isto está errado" sem clarear a tela inteira.
 */
export const temaEscuro: Tema = {
  id: "escuro",
  nome: "Escuro",
  descricao: "Fundo escuro, para uso à noite e com pouca luz.",
  esquema: "escuro",
  cores: {
    /**
     * Navy escuro, e não o azul claro clareado que a regra de "cor forte se lê pelo brilho"
     * (ver cabeçalho) sugeriria por padrão — pedido explícito do Gabriel: o `primary` original
     * (`#7FB2FF`) pintava áreas grandes (fundo da grade do calendário, capa do Alarme, hero de
     * Ajustes) com um azul claro demais para o resto da paleta escura, e competia com ela em vez
     * de se somar. `onPrimary` vira branco puro — 10.4:1 de contraste, bem acima do AA — porque
     * é o texto/ícone sobre uma cor agora escura, como em qualquer superfície escura do tema.
     */
    primary: "#1E3A8A",
    onPrimary: "#FFFFFF",
    primaryContainer: "#15275C",
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
     * tema (mesmo o navy escurecido) competia com o resto da paleta escura em vez de se somar a
     * ela. `surfaceContainerHigh` é o degrau mais alto de superfície neutra que o tema já tem —
     * perto do fundo o bastante pra não gritar, claro o bastante pra ainda se notar como bloco.
     */
    superficieDeDestaque: "#343D4A",
    onSuperficieDeDestaque: "#E6E9EE",

    secondary: "#B9C4DA",
    onSecondary: "#232D3F",
    secondaryContainer: "#2C374A",
    onSecondaryContainer: "#D6E0F5",

    tertiary: "#FFB782",
    tertiaryContainer: "#6B3000",
    onTertiaryContainer: "#FFDCC4",

    warning: "#F5B54A",
    warningSurface: "#2E2513",
    onWarningSurface: "#F8D89A",

    error: "#FF9A92",
    onError: "#5C0006",
    errorContainer: "#8C1017",
    onErrorContainer: "#FFDAD7",

    success: "#68DE94",
    onSuccess: "#00391A",
    successContainer: "#0B5730",
    onSuccessContainer: "#A6F4C0",

    successSurface: "#12281C",
    errorSurface: "#2E1618",

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
  },
  ajustes: {
    contornarSuperficies: false,
    reforcarFormaEIcone: false,
    textoDeApoioMaisForte: false,
  },
};
