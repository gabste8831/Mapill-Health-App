import type { TextStyle } from "react-native";

/**
 * ## A altura de linha não pode ser menor que a caixa da fonte
 *
 * A Plus Jakarta Sans desce 260 unidades por em: uma linha precisa de **1,26 × o tamanho** para
 * caber ascendente e descendente inteiras. Abaixo disso o sistema corta a perna das letras que
 * descem — g, p, q, j, y —, e o defeito só aparece com o texto certo: "Olá, Gabriel." estava
 * inteiro e "Olá, gabriel." saía com o g cortado.
 *
 * Os três títulos grandes estavam em 1,2× e cortavam. Quem muda um tamanho aqui confere a conta:
 * `lineHeight >= fontSize * 1.26`.
 *
 * Fonte: Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`, carregada em
 * `src/app/_layout.tsx`). Pesos leves (300) só em telas de apresentação — texto que
 * carrega informação clínica (dose, horário, nome do medicamento) usa sempre 500+,
 * priorizando legibilidade pro público idoso/polimedicado sobre a estética editorial.
 */
export const typography: Record<string, TextStyle> = {
  headlineXl: {
    fontFamily: "PlusJakartaSans_300Light",
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -0.32,
  },
  headlineMd: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  headlineSm: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  /**
   * Mesmo tamanho do `headlineSm`, em peso normal. Em 18px a Plus Jakarta fica encorpada demais
   * em semibold — este é o título de item que não precisa disputar atenção, como o rótulo dos
   * cards de escolha.
   */
  headlineSmRegular: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 16,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  /**
   * Texto de apoio pequeno — mensagem de erro, dica sob um número, princípio ativo numa sugestão.
   *
   * **Não é o `label` menor.** `label` é rótulo: vem em caixa alta, com espaçamento entre letras, e
   * serve para nomear uma seção. Isto aqui é frase, e frase em caixa alta se lê mais devagar.
   *
   * Nasceu tarde: sete lugares faziam `...bodyMd, fontSize: 12` porque não havia onde pegar isto
   * pronto, e dois arquivos chegaram a escrever `...typography.bodySm` — que **não existia**, e
   * espalhar `undefined` não dá erro: os dois textos herdavam a fonte do sistema em vez da Plus
   * Jakarta, em silêncio.
   */
  bodySm: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  /**
   * Rótulo de campo — "Nome da medicação", "Receita válida até", "Quantidade".
   *
   * **Não transforma a caixa.** Ele já foi `uppercase`, e a caixa alta tinha virado o default de
   * todo texto pequeno do app em vez de uma decisão: rótulo de campo, pergunta do formulário e
   * legenda usavam o mesmo token, então "Você já tomou alguma delas hoje?" chegava gritada na
   * tela. Palavra em caixa alta se lê mais devagar — o olho reconhece o contorno da palavra, e a
   * maiúscula achata ascendente e descendente num retângulo só, o que pesa justamente para quem
   * lê com dificuldade.
   *
   * O que separa o rótulo do valor passa a ser **peso e cor** (semibold em `onSurfaceVariant`
   * contra regular em `onSurface`), que é hierarquia mais forte que forma e não custa leitura.
   * Selo continua em caixa alta, no `caption` — ali a palavra é reconhecida, não lida.
   *
   * O `letterSpacing` saiu junto: ele existia para afrouxar o aperto do maiúsculo, e em caixa
   * normal só espalha a palavra.
   *
   * **13, e não 12.** A caixa alta ocupa mais largura mas também mais altura visual: a maiúscula
   * preenche toda a caixa da letra, enquanto a minúscula gasta metade dela em altura de x. Ao
   * perder o maiúsculo o rótulo encolheu na tela sem mudar de `fontSize`, e um degrau devolve a
   * presença que ele tinha. É o mesmo 13 que o painel de permissões já usava à mão.
   */
  label: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  /**
   * O degrau abaixo do `label`: selo e legenda — "ATRASADA", "OBRIGATÓRIO", as iniciais dos dias
   * sob as barras da semana.
   *
   * Dez lugares já escreviam `...label, fontSize: 10`, ou seja, o token existia de fato e só não
   * tinha nome. Formalizá-lo documenta que a escala tem esse degrau e para de convidar a
   * sobrescrita — que é como o 10 vira 9 em algum canto e ninguém percebe.
   *
   * **É o único token que ainda sobe a caixa**, e aqui ela é decisão: selo é etiqueta, uma palavra
   * que se reconhece de relance em vez de se ler, e o bloco compacto do maiúsculo ajuda nisso. Se
   * o texto for uma frase, o token errado é este.
   */
  caption: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // Variante "peso forte" pra informação crítica (dose, horário) mesmo em contextos
  // onde o resto da tela usa peso leve (ex: "14:30" dentro do card de headline leve).
  headlineXlBold: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: -0.8,
  },
  // Comfortaa (`@expo-google-fonts/comfortaa`) é a fonte da wordmark "Mapill" — reservada
  // pra marca/logo, nunca pro resto da UI (formulários, listas, texto corrido).
  brandWordmark: {
    fontFamily: "Comfortaa_700Bold",
    fontSize: 32,
    lineHeight: 42,
    /**
     * Negativo para aproximar as letras do logotipo original.
     *
     * A Comfortaa é desenhada com bastante respiro entre caracteres — bom para texto, largo demais
     * para uma marca de cinco letras, que se lê como uma forma só e não como uma palavra. Fechar o
     * espaço é o que aproxima a wordmark tipográfica do desenho que ela substituiu.
     */
    letterSpacing: -1,
  },
};
