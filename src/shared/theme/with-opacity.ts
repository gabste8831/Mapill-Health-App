/**
 * Aplica opacidade a uma cor hex do tema (`#RRGGBB`), retornando `rgba(...)`. Necessário porque
 * a prop `opacity` do React Native afeta o componente inteiro (ex: `TextInput.opacity` deixaria
 * o texto digitado transparente também, não só o placeholder) — pra clarear só uma cor
 * específica, a opacidade precisa estar embutida na própria cor.
 */
export function withOpacity(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function canaisDoHex(hexColor: string): [number, number, number] {
  const hex = hexColor.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

/**
 * Mistura duas cores do tema numa terceira **opaca**, na proporção dada (0 = só a base, 1 = só a
 * tinta).
 *
 * Diferente de `withOpacity`, que devolve `rgba` translúcido: translucidez deixa passar o que está
 * atrás, e o resultado muda conforme a superfície embaixo — um bloco de aviso ficaria de um tom
 * dentro de um popup branco e de outro sobre o cinza da tela. Aqui a cor sai calculada e fixa.
 *
 * Serve para encorpar uma superfície de estado sem trocar o token dela: misturar um pouco do texto
 * (`onWarningSurface`) no fundo (`warningSurface`) dá corpo mantendo a família de cor, e cada tema
 * continua resolvendo o próprio par — inclusive o escuro, onde a "tinta" é clara e a base escura.
 */
export function misturarCores(tinta: string, base: string, proporcao: number): string {
  const [tintaR, tintaG, tintaB] = canaisDoHex(tinta);
  const [baseR, baseG, baseB] = canaisDoHex(base);
  const misturar = (canalDaTinta: number, canalDaBase: number) =>
    Math.round(canalDaBase + (canalDaTinta - canalDaBase) * proporcao);
  return `rgb(${misturar(tintaR, baseR)}, ${misturar(tintaG, baseG)}, ${misturar(tintaB, baseB)})`;
}
