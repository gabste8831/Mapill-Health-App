import type { SyncableEntity } from "./syncable";

/** Compareceu ou não. Sem `null` aqui — a ausência de resposta é a ausência do próprio campo. */
export type AppointmentOutcome = "attended" | "missed";

/**
 * As antecedências oferecidas de pronto, em dias. Não é uma lista fechada: o formulário aceita
 * qualquer número, e estas são só os atalhos para os casos comuns.
 */
export const APPOINTMENT_REMINDER_LEAD_DAYS: readonly number[] = [1, 3, 7];

export type Appointment = SyncableEntity & {
  /**
   * O que é o compromisso, em texto livre — "Consulta com cardiologista", "Coleta de sangue",
   * "Sessão de terapia".
   *
   * Deixou de ser lista fechada em 2026-08-24: a lista real não fecha, e cada opção que falta
   * obriga quem cadastra a escolher a menos errada e explicar o resto na observação. O nome que a
   * pessoa dá é o nome pelo qual ela vai reconhecer o compromisso na agenda depois.
   */
  title: string;
  /** Instante do compromisso, em ISO. Data e hora juntas: consulta sem hora não é compromisso. */
  scheduledFor: string;
  /** Onde é — "Clínica São José, sala 12". Opcional: nem todo exame tem endereço útil. */
  location: string | null;
  /** Nome do profissional — "Dra. Ana Martins, cardiologista". */
  professional: string | null;
  /** Preparo e o que levar: "jejum de 12h", "levar exames antigos". Escrita **antes**. */
  notes: string | null;
  /**
   * Com quantos dias de antecedência avisar, para dar tempo de se organizar. `null` = sem aviso
   * antecipado.
   *
   * Antecedência **em dias**, e não um horário como a dose: o que a pessoa precisa é de tempo para
   * remarcar o trabalho ou arrumar carona, e isso não se resolve com um aviso trinta minutos antes.
   */
  reminderLeadDays: number | null;
  /**
   * Avisar também no próprio dia. Independente da antecedência de propósito — são pedidos
   * diferentes, e quem marca consulta costuma querer os dois: uma semana antes para se organizar,
   * e no dia para não esquecer o que já estava planejado.
   */
  reminderOnDay: boolean;
  /**
   * O que aconteceu. `null` = ainda não respondido, e **nunca** vira `missed` sozinho quando a
   * data passa: ausência de resposta não é desfecho, e registrar uma falta que ninguém confirmou
   * sujaria o histórico que este campo existe para manter confiável. Mesma regra da dose não
   * resolvida (decisão nº11.5).
   */
  outcome: AppointmentOutcome | null;
  /**
   * O que saiu dali — "médico pediu hemograma", "remarcado para o dia 12".
   *
   * Separado de `notes` porque são de tempos diferentes: `notes` é preparação, escrita antes, e
   * perde utilidade quando o compromisso passa; esta nasce depois, e é a que vale a longo prazo
   * para reconstruir o acompanhamento.
   */
  outcomeNotes: string | null;
};

/** Se o compromisso tem algum aviso pedido — qualquer um dos dois canais. */
export function hasReminder(appointment: Appointment): boolean {
  return appointment.reminderLeadDays !== null || appointment.reminderOnDay;
}
