/** Paleta Material 3 extraída dos protótipos HTML (Home, Escanear código, Cadastro manual). */
export const colors = {
  primary: "#0057BF",
  onPrimary: "#FFFFFF",
  primaryContainer: "#026FEF",
  onPrimaryContainer: "#FEFCFF",

  secondary: "#545F73",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D5E0F8",
  onSecondaryContainer: "#586377",

  tertiary: "#994200",
  tertiaryContainer: "#C05400",
  onTertiaryContainer: "#FFFBFF",

  /**
   * O amarelo de aviso das dicas. O marrom do `tertiary` cumpria a função de separar do texto, mas
   * lia como "nota de rodapé" — e a dica do copinho de xarope é justamente onde a pessoa erra a
   * dose. Amarelo é a cor que o mundo inteiro usa para "preste atenção nisto".
   *
   * O tom cheio fica na barra lateral, não no fundo: `#FFE600` atrás de um parágrafo tem contraste
   * de sobra, mas berra mais que o vermelho de erro, e uma dica não pode gritar mais alto que um
   * problema. O fundo é o mesmo amarelo bem diluído.
   */
  warning: "#FFE600",
  warningSurface: "#FFFBE0",
  onWarningSurface: "#5C4A00",

  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",

  /**
   * O verde de "está certo agora" — a dose dentro da janela do horário.
   *
   * Não estava na paleta dos protótipos porque até aqui o app só precisava dizer "faça" (azul) e
   * "está errado" (vermelho). A dose na hora é um terceiro caso: não pede atenção como um erro nem
   * espera como uma pendência, ela confirma que este é o momento. Escolhido no mesmo tom do
   * Material 3 e escurecido até passar 4.5:1 sobre o container claro, que é o par em que ele
   * sempre aparece.
   */
  success: "#116D34",
  onSuccess: "#FFFFFF",
  successContainer: "#A6F4C0",
  onSuccessContainer: "#005223",

  /**
   * As versões **diluídas** de sucesso e erro, para fundo de cartão numa lista.
   *
   * `successContainer` e `errorContainer` são os tons do Material para um chip ou um selo pequeno —
   * numa área grande eles gritam, e dois cartões saturados em sequência (a dose atrasada logo acima
   * da que é agora) anulam a hierarquia que a cor deveria criar. Estes são claros o bastante para
   * tingir sem chamar mais atenção que o texto que carregam.
   */
  successSurface: "#EAF7EE",
  errorSurface: "#FDECEA",

  background: "#F7F9FB",
  onBackground: "#191C1E",
  surface: "#F7F9FB",
  surfaceBright: "#F7F9FB",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F4F6",
  surfaceContainer: "#ECEEF0",
  surfaceContainerHigh: "#E6E8EA",
  onSurface: "#191C1E",
  onSurfaceVariant: "#414754",

  /**
   * Escurecido de `#727786` para `#696E7C` em 30/08, na varredura de acessibilidade.
   *
   * O tom antigo dava **4.47:1** sobre branco e 4.24:1 sobre o fundo da tela — reprovado no AA
   * (4.5:1) por uma margem que nenhum olho pega, e é por isso que o checklist manda medir em vez
   * de julgar olhando. Ele não é só cor de borda: quatro telas o usam como **texto de apoio**
   * (o resumo da ficha, a finalidade no consentimento, o status dos termos), e aí ele precisa
   * passar como texto. Agora dá 5.09:1 e 4.83:1, com folga nos dois fundos.
   */
  outline: "#696E7C",
  outlineVariant: "#C1C6D7",
} as const;

export type ColorToken = keyof typeof colors;
