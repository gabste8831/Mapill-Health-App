/**
 * Máscaras de número digitado. O teclado decimal do sistema é sugestão, não trava: ele deixa
 * digitar duas vírgulas, letras em alguns aparelhos, e nada impede colar texto. Filtrar na
 * entrada é o que faz o campo recusar o impossível no momento em que acontece, em vez de
 * reclamar depois que a pessoa já saiu dali.
 */

/** Só dígitos. Para o que não se divide: gota, adesivo, sachê, dias. */
export function formatIntegerInput(rawValue: string, maxDigits = 8): string {
  return rawValue.replace(/\D/g, "").slice(0, maxDigits);
}

/**
 * Dígitos com uma vírgula decimal. Ponto vira vírgula porque é o separador que o teclado
 * brasileiro oferece e o que a pessoa espera ver escrito.
 */
export function formatDecimalInput(rawValue: string, maxDecimals = 3): string {
  const limpo = rawValue.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const [inteira, ...resto] = limpo.split(",");
  if (resto.length === 0) return inteira.slice(0, 8);
  return `${inteira.slice(0, 8)},${resto.join("").slice(0, maxDecimals)}`;
}

/** `"1,5"` → `1.5`. `NaN` quando não é número — quem chama decide o que fazer com isso. */
export function parseDecimalInput(value: string): number {
  return Number(value.replace(",", "."));
}
