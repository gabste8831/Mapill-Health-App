/**
 * Máscara e conversão de data digitada (`DD/MM/AAAA`) — sem depender de lib de máscara.
 *
 * Aqui só existe validade de calendário. Regra de domínio (não pode ser futuro, não pode ser
 * antes de 1900) é de quem chama: nascimento e início de tratamento têm limites opostos, e
 * embutir um deles aqui quebraria o outro.
 */

/** Aceita só dígitos e insere as barras conforme o paciente digita. */
export function formatDateInput(rawValue: string, previousValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
  // Deleção: se o usuário está apagando, não força a barra de volta.
  if (rawValue.length < previousValue.length) return rawValue;

  const day = digitsOnly.slice(0, 2);
  const month = digitsOnly.slice(2, 4);
  const year = digitsOnly.slice(4, 8);

  if (digitsOnly.length <= 2) return day;
  if (digitsOnly.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
}

/** `DD/MM/AAAA` → ISO `YYYY-MM-DD`, ou `null` se não for data de calendário real. */
export function parseDateInput(displayValue: string): string | null {
  const match = displayValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  const date = new Date(year, month - 1, day);
  // Rejeita 31/02 e afins: o JS "corrige" pra 03/03 em vez de recusar, então comparamos de volta.
  const isRealCalendarDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealCalendarDate) return null;

  return `${yearText}-${monthText}-${dayText}`;
}

/** ISO `YYYY-MM-DD` → `DD/MM/AAAA` do input. Vazio continua vazio. */
export function toDateInput(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Hoje em ISO `YYYY-MM-DD`, no fuso local — `toISOString()` devolveria UTC e erraria o dia. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
