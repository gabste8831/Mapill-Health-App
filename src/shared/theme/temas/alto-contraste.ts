import type { Tema } from "./tipos";

/**
 * # Alto contraste
 *
 * ## Para quem
 *
 * Catarata, degeneração macular, glaucoma — e também a situação banal de usar o celular sob sol
 * forte. É o tema mais relevante para o público real deste app: a incidência de catarata passa de
 * 50% acima dos 65 anos, que é exatamente a faixa de quem toma vários remédios por dia.
 *
 * ## O que muda, e por quê
 *
 * **Preto absoluto sobre branco absoluto: 21:1.** O tema padrão usa `#141719` sobre `#F1F4F8`
 * (14.8:1) porque cinza-escuro sobre off-white é mais confortável para vista saudável. Para vista
 * comprometida, conforto é secundário — o que importa é o degrau máximo possível.
 *
 * **O azul escurece em vez de clarear.** `#0B5FD9` dá 6.4:1, aprovado no AA mas não no AAA. Aqui
 * ele vira `#00337A`, que dá **11.2:1**: continua sendo azul, continua sendo a cor da ação, e
 * passa no AAA com folga para texto pequeno.
 *
 * **Contorno em vez de sombra** (`contornarSuperficies: true`). A regra de "sombra e nunca borda"
 * pressupõe enxergar 8% de opacidade. Quem escolheu este tema não enxerga — e aí a sombra não é
 * discrição, é informação perdida. O contorno devolve a fronteira do cartão.
 *
 * **Forma e ícone reforçados** (`reforcarFormaEIcone: true`). Vista comprometida frequentemente
 * vem junto de percepção de cor reduzida, então vale a mesma regra do tema de daltonismo.
 *
 * **Os estados perdem o pastel.** `errorSurface` (`#FDECEA`) é quase branco: quem tem catarata não
 * distingue aquilo de branco. Aqui as superfícies de estado são nitidamente tingidas.
 */
export const temaAltoContraste: Tema = {
  id: "altoContraste",
  nome: "Alto contraste",
  descricao: "Preto sobre branco, contornos visíveis. Para baixa visão e uso sob sol.",
  esquema: "claro",
  cores: {
    primary: "#00337A",
    onPrimary: "#FFFFFF",
    primaryContainer: "#00448F",
    onPrimaryContainer: "#FFFFFF",
    /** Tema claro: `primary` já lê bem como tinta, então é o mesmo valor. */
    corDeDestaque: "#00337A",
    superficieDeDestaque: "#00337A",
    onSuperficieDeDestaque: "#FFFFFF",
    primarySurface: "#DCE9FF",
    onPrimarySurface: "#00274F",

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
  },
  ajustes: {
    contornarSuperficies: true,
    reforcarFormaEIcone: true,
    textoDeApoioMaisForte: true,
  },
};
