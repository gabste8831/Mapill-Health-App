import type { Tema } from "./tipos";

/**
 * # Alto contraste
 *
 * Para catarata, degeneração macular, glaucoma, e para o uso sob sol forte. É o tema mais relevante
 * para o público do app: a incidência de catarata passa de 50% acima dos 65 anos.
 *
 * O que muda em relação ao padrão:
 *
 * - Preto sobre branco absolutos, 21:1. O padrão fica em 14.8:1 por conforto, que aqui é secundário.
 * - O azul escurece em vez de clarear, para passar no AAA (11.2:1) e não só no AA.
 * - `contornarSuperficies`: a regra de "sombra e nunca borda" pressupõe enxergar 8% de opacidade.
 * - `reforcarFormaEIcone`: vista comprometida costuma vir com percepção de cor reduzida.
 * - Superfícies de estado tingidas, porque o pastel do padrão não se distingue de branco.
 */
export const temaAltoContraste: Tema = {
  id: "altoContraste",
  nome: "Alto contraste",
  descricao: "Preto sobre branco, contornos visíveis. Para baixa visão e uso sob sol.",
  esquema: "claro",
  cores: {
    /**
     * `#0044A3`, e não o `#00337A` de antes.
     *
     * O anterior dava **11.97:1** sobre branco, quando o teto que este tema persegue é o AAA da
     * WCAG: **7:1**. Ou seja, ele estava pagando escuridão por um contraste que ninguém exige — e
     * o preço aparece onde o azul cobre área grande (a faixa do calendário, o card de próxima
     * dose, a capa do alarme), que num tom quase marinho lê como bloco preto e não como a cor da
     * ação. Um app inteiro em azul-marinho não é mais legível, é só mais sombrio.
     *
     * O novo passa em AAA em **todas** as superfícies do tema, e a folga é medida: 8.91:1 sobre
     * branco, 7.12:1 no pior caso (o `surfaceContainer`, onde ele tinge chip). O degrau seguinte
     * (`#004AAD`) cairia para 6.49 ali e perderia o AAA justamente onde a cor vira fundo.
     */
    primary: "#0044A3",
    onPrimary: "#FFFFFF",
    primaryContainer: "#00539E",
    onPrimaryContainer: "#FFFFFF",
    /** Tema claro: `primary` já lê bem como tinta, então é o mesmo valor. */
    corDeDestaque: "#0044A3",
    superficieDeDestaque: "#0044A3",
    onSuperficieDeDestaque: "#FFFFFF",
    primarySurface: "#DCE9FF",
    // Acompanha o `primary`: em `#00274F` dava 12.22:1 sobre o fundo azul-claro, a mesma folga
    // excessiva que motivou clarear a cor principal. Aqui fica 9.9:1, ainda AAA com sobra.
    onPrimarySurface: "#00396E",

    secondary: "#2A3242",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#CBD6EA",
    onSecondaryContainer: "#141A24",


    warning: "#7A3D00",
    warningSurface: "#FFEBCC",
    onWarningSurface: "#3D1F00",
    /** Amarelo cheio com preto absoluto: 12.6:1, e é exatamente o que este tema quer. */
    warningVivo: "#FFC107",
    onWarningVivo: "#000000",

    error: "#9E0008",
    onError: "#FFFFFF",
    errorContainer: "#FFC9C4",
    onErrorContainer: "#4A0003",

    success: "#00522A",
    onSuccess: "#FFFFFF",
    successContainer: "#8CE8AE",
    onSuccessContainer: "#002713",

    successSurface: "#D6F5E1",
    errorSurface: "#FFDEDA",
    /** Mais fechado que o `error`, para o AAA que este tema persegue: 9.4:1 sobre a superficie. */
    onErrorSurface: "#5C0004",

    /**
     * Aqui o vivo quase não se afasta do normal, e é o ponto do tema.
     *
     * Quem escolhe alto contraste está dizendo que precisa de separação máxima entre figura e
     * fundo. Ganhar vivacidade custa contraste — é a mesma troca do tema padrão, só que aqui ela vai
     * na direção contrária ao que o tema promete. Então o passo é curto: `#046B36` e `#C21118`
     * ficam em 5.70:1 e 4.93:1 na pior superfície, contra os 8.04 e 6.80 dos escuros. Mais vivo que
     * isso começaria a desfazer a razão de o tema existir.
     */
    successVivo: "#046B36",
    errorVivo: "#C21118",
    /** Igual ao `error`: no alto contraste, o fundo preenchido é o mais escuro possível. */
    errorPreenchido: "#9E0008",
    onErrorPreenchido: "#FFFFFF",

    background: "#FFFFFF",
    onBackground: "#000000",
    surface: "#FFFFFF",
    surfaceBright: "#FFFFFF",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F0F2F5",
    surfaceContainer: "#E2E6EC",
    surfaceContainerHigh: "#D2D8E0",
    onSurface: "#000000",
    /** Sem cinza-claro: o texto de apoio aqui é quase tão escuro quanto o principal (9.7:1). */
    onSurfaceVariant: "#2B3038",

    outline: "#3A4049",
    /** O contorno precisa ser visto: cinza-claro viraria a mesma ausência que a sombra era. */
    outlineVariant: "#6B7280",
    /** Preto a 70%: neste tema o veu tambem separa por contraste, e nao so por escurecimento. */
    scrim: "rgba(0, 0, 0, 0.7)",
  },
  ajustes: {
    contornarSuperficies: true,
    reforcarFormaEIcone: true,
    textoDeApoioMaisForte: true,
  },
};
