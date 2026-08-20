/** Máscara e validação de horário digitado (`HH:MM`, 24h). */

/** Aceita só dígitos e insere os dois-pontos conforme o paciente digita. */
export function formatTimeInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 4);
  if (rawValue.length < previousValue.length) return rawValue;

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
