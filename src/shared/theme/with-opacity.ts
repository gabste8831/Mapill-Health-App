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
