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

/** Máximo de horas entre uma dose e a seguinte que ainda descreve um intervalo dentro do dia. */
export const MAX_INTERVALO_EM_HORAS = 23;

/**
 * Os horários de "de X em X horas", a partir do primeiro.
 *
 * Existe porque "de 3 em 3 horas" é como o médico fala, e traduzir isso em oito horários exige
 * uma conta que ninguém deveria fazer de cabeça na frente do formulário — o erro de somar errado
 * cairia direto no lembrete. **Não é sugestão**: os dois números saem de quem está preenchendo, e
 * a lista resultante fica à vista antes de ser aplicada.
 *
 * Passa da meia-noite quando precisa (23:00 + 3h = 02:00), porque intervalo curto atravessa o dia
 * e cortar ali perderia as doses da madrugada.
 */
export function horariosEmSerie(
  primeiro: string,
  intervaloEmHoras: number,
  quantidade: number,
): string[] {
  const [horas, minutos] = primeiro.split(":").map(Number);
  const base = horas * 60 + minutos;
  return Array.from({ length: quantidade }, (_, indice) => {
    const total = (base + indice * intervaloEmHoras * 60) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  });
}

/**
 * Se a série cabe num dia sem repetir horário. `4 doses de 8 em 8 horas` daria a volta completa e
 * a quarta cairia em cima da primeira — o app agendaria duas doses no mesmo instante, que é
 * exatamente o conflito que o seletor barra quando os horários são escolhidos à mão.
 */
export function serieCabeNoDia(intervaloEmHoras: number, quantidade: number): boolean {
  return intervaloEmHoras * quantidade <= 24;
}

/** `null` se não for um horário real — 25:00 e 08:70 são recusados. */
export function parseTimeInput(displayValue: string): string | null {
  const match = displayValue.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  if (Number(match[1]) > 23 || Number(match[2]) > 59) return null;
  return displayValue;
}
