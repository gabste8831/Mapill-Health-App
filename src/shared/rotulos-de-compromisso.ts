import type { Appointment } from "@/domain/entities/appointment";

/**
 * Como o aviso de um compromisso é dito em português. Fora das telas pelo mesmo motivo dos rótulos
 * de medicamento: cadastro e agenda falam do mesmo compromisso, e tabelas duplicadas divergiriam
 * sem nada no código denunciar.
 */

/** "1 dia antes", "7 dias antes". */
export function rotuloDeAntecedencia(leadDays: number): string {
  return leadDays === 1 ? "1 dia antes" : `${leadDays} dias antes`;
}

/**
 * O aviso inteiro numa frase — "7 dias antes e no dia", "no dia", "7 dias antes".
 *
 * Os dois canais são independentes, então a frase precisa dar conta das quatro combinações sem
 * que a agenda tenha que montar o texto por conta própria em cada lugar onde ele aparece.
 */
export function resumirAviso(appointment: Appointment): string | null {
  const partes: string[] = [];
  if (appointment.reminderLeadDays !== null) {
    partes.push(rotuloDeAntecedencia(appointment.reminderLeadDays));
  }
  if (appointment.reminderOnDay) partes.push("no dia");
  if (partes.length === 0) return null;
  return partes.join(" e ");
}
