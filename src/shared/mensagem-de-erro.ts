/**
 * O que dizer à pessoa quando uma operação falha.
 *
 * Mostrar `error.message` cru parece transparência, mas o que chega à tela é o texto de quem
 * escreveu a biblioteca, não uma frase dirigida a alguém. O caso que motivou isto: uma falha de
 * concorrência no SQLite virou o diálogo `Call to function 'NativeStatement.finalizeAsync' has been
 * rejected. → Caused by: Error code : database is locked` para quem só queria confirmar um remédio.
 *
 * A regra é o **destinatário**: erro de domínio é escrito para ser lido — "Sem estoque suficiente" —
 * e passa. Erro nativo, de rede ou de banco é diagnóstico, e vira uma frase que diz o que fazer.
 * Não há como distingui-los com certeza, então a heurística é conservadora: só passa o que tem cara
 * de frase (curta, sem jargão típico de stack).
 *
 * O texto original nunca se perde — vai para o console, onde serve a quem depura.
 */
const MARCAS_DE_ERRO_TECNICO = [
  "Call to function",
  "has been rejected",
  "Error code",
  "Exception",
  "SQLITE",
  "database is locked",
  "NativeStatement",
  "at ",
  "undefined is not",
  "null is not",
  "Network request failed",
];

const TAMANHO_MAXIMO_DE_FRASE = 120;

export function mensagemParaAPessoa(
  cause: unknown,
  reserva = "Tente novamente em instantes.",
): string {
  if (__DEV__) console.warn("[erro]", cause);

  if (!(cause instanceof Error)) return reserva;

  const texto = cause.message.trim();
  if (texto.length === 0 || texto.length > TAMANHO_MAXIMO_DE_FRASE) return reserva;
  if (MARCAS_DE_ERRO_TECNICO.some((marca) => texto.includes(marca))) return reserva;
  // Uma frase para gente tem espaços; "TypeError" e "ENOENT" não têm.
  if (!texto.includes(" ")) return reserva;

  return texto;
}
