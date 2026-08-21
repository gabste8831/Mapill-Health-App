/** Máscara e validação de horário digitado (`HH:MM`, 24h). */

/**
 * Aceita só dígitos e insere os dois-pontos conforme o paciente digita.
 *
 * Dígito que tornaria o horário impossível é recusado na hora: nada de aceitar "50:00" pra
 * reclamar depois, quando a pessoa já saiu do campo e não faz ideia de onde estava o erro. É
 * mais barato não deixar digitar do que explicar.
 */
export function formatTimeInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 4);
  // Deleção: se o paciente está apagando, não força os dois-pontos de volta.
  if (rawValue.length < previousValue.length) return rawValue;

  const isImpossible =
    digitsOnly[0] > "2" ||
    (digitsOnly[0] === "2" && digitsOnly[1] > "3") ||
    digitsOnly[2] > "5";
  if (isImpossible) return previousValue;

  const hours = digitsOnly.slice(0, 2);
  const minutes = digitsOnly.slice(2, 4);

  if (digitsOnly.length <= 2) return hours;
  return `${hours}:${minutes}`;
}

/** `null` se não for um horário real — 25:00 e 08:70 são recusados. */
export function parseTimeInput(displayValue: string): string | null {
  const match = displayValue.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  if (Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return displayValue;
}
