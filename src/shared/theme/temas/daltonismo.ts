import type { Tema } from "./tipos";

/**
 * # Modo sem depender de cor (daltonismo)
 *
 * ## O problema que ele resolve
 *
 * Deuteranopia e protanopia — as duas formas mais comuns de daltonismo — atingem cerca de **1 homem
 * em 12**, e ambas confundem justamente **vermelho com verde**. Que são, neste app, as duas cores
 * mais carregadas de significado: vermelho é "dose atrasada", verde é "é agora, tome". Para essas
 * pessoas, os dois cartões mais importantes da agenda são o mesmo cartão bege.
 *
 * ## Por que a paleta muda pouco
 *
 * A tentação é trocar verde por azul. Não serve: azul já é a cor da ação neste app, e usá-lo
 * também para "está certo" apagaria a distinção entre "toque aqui" e "isto está resolvido".
 *
 * A saída correta é a que a literatura de acessibilidade chama de **redundância**: a cor continua
 * lá, mas nunca sozinha. Quem enxerga as cores lê o app como sempre; quem não enxerga lê o ícone e
 * o rótulo — e é por isso que `reforcarFormaEIcone` é o que realmente faz este tema funcionar, e
 * não os poucos ajustes de tinta abaixo.
 *
 * ## Os ajustes de tinta que sobram
 *
 * O verde puxa para o **azul-esverdeado** (teal) e o vermelho puxa para o **magenta**. Nenhum dos
 * dois vira outra cor aos olhos de quem enxerga normalmente, mas eles se separam em luminosidade
 * e em matiz de um jeito que sobrevive à deuteranopia — enquanto o par verde-grama/vermelho-tijolo
 * original colapsa nos dois em tons quase idênticos.
 *
 * O âmbar de atenção também escurece: amarelo e verde-claro são o par que a protanopia mais
 * confunde.
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
    primaryContainer: "#2B7BF5",
    onPrimaryContainer: "#FFFFFF",
    primarySurface: "#EAF1FE",
    onPrimarySurface: "#0A3F8F",

    secondary: "#545F73",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D5E0F8",
    onSecondaryContainer: "#3D4757",

    tertiary: "#8A4200",
    tertiaryContainer: "#A85200",
    onTertiaryContainer: "#FFFFFF",

    /** Âmbar escuro: amarelo claro é o que a protanopia mais confunde com verde. */
    warning: "#8A5A00",
    warningSurface: "#FBF0D9",
    onWarningSurface: "#5C3B00",

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
  },
  ajustes: {
    contornarSuperficies: false,
    /** O que de fato faz este tema funcionar: cor nunca sozinha. */
    reforcarFormaEIcone: true,
    textoDeApoioMaisForte: false,
  },
};
