import type { Tema } from "./tipos";

/**
 * # Modo sem depender de cor (daltonismo)
 *
 * Deuteranopia e protanopia atingem cerca de 1 homem em 12, e as duas confundem vermelho com verde,
 * que aqui são "dose atrasada" e "é agora, tome". Sem tratamento, os dois cartões mais importantes
 * da agenda viram o mesmo cartão.
 *
 * Trocar verde por azul não serve: azul já é a cor da ação, e reusá-lo apagaria a distinção entre
 * "toque aqui" e "isto está resolvido". A saída é redundância, a cor nunca sozinha, e por isso quem
 * faz este tema funcionar é `reforcarFormaEIcone`, não os ajustes de tinta.
 *
 * Nos ajustes, o verde puxa para teal e o vermelho para magenta: eles se separam em luminosidade e
 * matiz de um jeito que sobrevive à deuteranopia. O âmbar escurece porque amarelo e verde-claro são
 * o par que a protanopia mais confunde.
 */
export const temaDaltonismo: Tema = {
  id: "daltonismo",
  nome: "Sem depender de cor",
  descricao: "Ícone e texto sempre junto da cor. Auxilia em casos de daltonismo.",
  esquema: "claro",
  cores: {
    primary: "#0B5FD9",
    onPrimary: "#FFFFFF",
    /** Tema claro: `primary` já lê bem como tinta, então é o mesmo valor. */
    corDeDestaque: "#0B5FD9",
    superficieDeDestaque: "#0B5FD9",
    onSuperficieDeDestaque: "#FFFFFF",
    primaryContainer: "#1F6FE8",
    onPrimaryContainer: "#FFFFFF",
    primarySurface: "#EAF1FE",
    onPrimarySurface: "#0A3F8F",

    secondary: "#545F73",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D5E0F8",
    onSecondaryContainer: "#3D4757",


    /** Âmbar escuro: amarelo claro é o que a protanopia mais confunde com verde. */
    warning: "#8A5A00",
    warningSurface: "#FBF0D9",
    onWarningSurface: "#5C3B00",
    /**
     * Aqui o aceso é **laranja**, e não amarelo.
     *
     * Amarelo puro é o que a protanopia mais confunde com verde — e neste tema o verde já virou
     * turquesa justamente para se separar. Puxar o alerta para 38° o afasta dos dois, e a
     * luminosidade alta mantém o efeito de "lâmpada" que o token existe para dar.
     */
    warningVivo: "#F59E0B",
    onWarningVivo: "#231B00",

    /** Magenta-vermelho: separa da faixa do verde mesmo sem percepção de vermelho. */
    error: "#C2185B",
    onError: "#FFFFFF",
    errorContainer: "#FFD6E4",
    onErrorContainer: "#7A0033",

    /** Teal em vez de verde-grama: sobrevive à deuteranopia por matiz e luminosidade. */
    success: "#00696E",
    onSuccess: "#FFFFFF",
    successContainer: "#9CF0F5",
    onSuccessContainer: "#00363A",

    successSurface: "#E0F5F6",
    errorSurface: "#FCE8EF",
    /** Magenta escuro, o par da superficie deste tema. */
    onErrorSurface: "#7A0033",

    /**
     * Turquesa e magenta mais vivos — **não** verde grama e vermelho fogo.
     *
     * O tema inteiro existe para trocar o par verde/vermelho, que é justamente o que a deuteranopia
     * e a protanopia não separam. Trazer as cores vivas do tema padrão para cá desfaria isso: o
     * semáforo que fica nítido para quem enxerga as duas cores é exatamente o que some para quem
     * não enxerga.
     *
     * Então o que fica mais vivo é o par deste tema, mantendo a distância de matiz que o faz
     * funcionar. `#00838A` e `#D81B60` dão 4.02:1 e 4.22:1 na superfície tingida — acima dos 3:1 da
     * forma, e ainda separados por luminosidade além do matiz, que é a segunda pista para quem lê
     * as duas como tons de cinza.
     */
    successVivo: "#00838A",
    errorVivo: "#D81B60",
    /** Magenta preenchido: o mesmo par do tema, com o branco por cima ainda legível. */
    errorPreenchido: "#C2185B",
    onErrorPreenchido: "#FFFFFF",

    background: "#F1F4F8",
    onBackground: "#141719",
    surface: "#F1F4F8",
    surfaceBright: "#FFFFFF",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F5F7FA",
    surfaceContainer: "#E9EDF3",
    surfaceContainerHigh: "#DFE4EC",
    onSurface: "#141719",
    onSurfaceVariant: "#4A5160",

    outline: "#6B7280",
    outlineVariant: "#CBD2DE",
    scrim: "rgba(20, 23, 25, 0.45)",
  },
  ajustes: {
    contornarSuperficies: false,
    /** O que de fato faz este tema funcionar: cor nunca sozinha. */
    reforcarFormaEIcone: true,
    textoDeApoioMaisForte: false,
  },
};
