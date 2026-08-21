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

/**
 * Em que unidade a duração de um tratamento é dita. Existe porque "por 90 dias" não é como
 * ninguém pensa um tratamento de três meses — e porque mês não tem tamanho fixo, então converter
 * pra dias na entrada erraria a conta.
 */
export type DurationUnit = "days" | "weeks" | "months";

/** ISO `YYYY-MM-DD` → data local à meia-noite, ou `null` se não for o formato. */
function parseIsoDay(isoDate: string): Date | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Soma meses preservando o dia, e grudando no fim do mês quando ele não existe (31/01 + 1 = 28/02). */
function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));
  return target;
}

/**
 * Último dia de um tratamento que dura `amount` unidades a partir de `startIso`. O primeiro dia
 * conta, então "por 7 dias" a partir de hoje termina no sexto dia seguinte, não no sétimo — e
 * "por 3 meses" a partir de 21/08 termina em 20/11, não em 21/11.
 */
export function lastDayOfTreatment(
  startIso: string,
  amount: number,
  unit: DurationUnit,
): string | null {
  const match = startIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match || !Number.isInteger(amount) || amount < 1) return null;

  const [, year, month, day] = match;
  const start = new Date(Number(year), Number(month) - 1, Number(day));
  const afterEnd = unit === "months" ? addMonths(start, amount) : new Date(start);
  if (unit === "days") afterEnd.setDate(start.getDate() + amount);
  if (unit === "weeks") afterEnd.setDate(start.getDate() + amount * 7);

  afterEnd.setDate(afterEnd.getDate() - 1);
  return toIsoDate(afterEnd);
}

/**
 * Inverso de `lastDayOfTreatment` — usado ao abrir um cadastro que já tem data de fim gravada.
 * Tenta meses e semanas antes de cair em dias, senão um tratamento cadastrado como "3 meses"
 * reabriria como "91 dias", que está certo e não é o que a pessoa escreveu.
 */
export function treatmentDuration(
  startIso: string,
  endIso: string,
): { amount: number; unit: DurationUnit } | null {
  const start = parseDateInput(toDateInput(startIso));
  const end = parseDateInput(toDateInput(endIso));
  if (start === null || end === null) return null;

  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  if (days < 1) return null;

  // Abaixo de duas semanas, dia é a unidade natural — quem escreveu "7 dias" não quer reabrir
  // vendo "1 semana", ainda que seja o mesmo tratamento.
  if (days < 14) return { amount: days, unit: "days" };

  // Até 5 anos: além disso "tem prazo" deixou de descrever o caso, e dias serve.
  for (let months = 1; months <= 60; months += 1) {
    if (lastDayOfTreatment(startIso, months, "months") === end) return { amount: months, unit: "months" };
  }
  if (days % 7 === 0) return { amount: days / 7, unit: "weeks" };
  return { amount: days, unit: "days" };
}

/**
 * As duas viradas de um ciclo, contadas a partir de **hoje**.
 *
 * Existe porque "a cada 28 dias, 21 tomando" não diz nada sozinho: quem cadastra no quinto dia
 * da cartela precisa ver a pausa cinco dias mais cedo, e é a data que ela reconhece — não a
 * regra, que ela acabou de digitar. Devolver as duas datas é o que permite a tela mostrar a
 * consequência antes de salvar.
 *
 * `null` quando o ciclo não fecha (dia de uso maior que o ciclo, datas inválidas).
 */
export function cycleTurningPoints(
  todayIso: string,
  cycleStartIso: string,
  cycleLengthDays: number,
  activeDays: number,
): { lastDay: string; resumesOn: string; emPausa: boolean } | null {
  const today = parseIsoDay(todayIso);
  const cycleStart = parseIsoDay(cycleStartIso);
  if (today === null || cycleStart === null) return null;
  if (activeDays < 1 || cycleLengthDays < 2 || activeDays >= cycleLengthDays) return null;

  const decorridos = Math.round((today.getTime() - cycleStart.getTime()) / 86_400_000);
  const dayInCycle = ((decorridos % cycleLengthDays) + cycleLengthDays) % cycleLengthDays;

  const somarDias = (dias: number) => {
    const alvo = new Date(today);
    alvo.setDate(today.getDate() + dias);
    return toIsoDate(alvo);
  };

  const resumesOn = somarDias(cycleLengthDays - dayInCycle);
  const emPausa = dayInCycle >= activeDays;

  // Já na pausa, o trecho de uso que interessa é o do ciclo seguinte — dizer "você toma até
  // ontem" seria tecnicamente verdade e inútil.
  return emPausa
    ? { lastDay: somarDias(cycleLengthDays - dayInCycle + activeDays - 1), resumesOn, emPausa }
    : { lastDay: somarDias(activeDays - 1 - dayInCycle), resumesOn, emPausa };
}

/** Hoje em ISO `YYYY-MM-DD`, no fuso local — `toISOString()` devolveria UTC e erraria o dia. */
export function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
