/**
 * Minúsculas e sem acento, pra "acido folico" achar "Ácido fólico".
 *
 * Quem procura digita apressado e no teclado do celular, onde o acento custa dois toques. Vale para
 * qualquer busca do app: nome de remédio, título de consulta, nome de médico — em todas, exigir o
 * acento correto seria fazer o usuário adivinhar como o próprio cadastro dele foi escrito.
 */
export function normalizarBusca(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
