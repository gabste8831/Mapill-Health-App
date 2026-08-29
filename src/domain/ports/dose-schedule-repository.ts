import type { DoseSchedule } from "../entities/dose-schedule";
import type { IntakeStatus } from "../entities/intake-log";
import type { Repository } from "./repository";

/**
 * Uma dose agendada junto do último desfecho registrado para ela.
 *
 * O status vem **cru**, incluindo `deferred` — que não resolve a dose, mas deixou log, e é esse
 * log que uma correção retroativa precisa apontar. Quem lê decide o que conta como resolvido
 * usando `resolvesDose`.
 */
export type DoseScheduleWithStatus = {
  doseSchedule: DoseSchedule;
  /** `null` = nunca houve log. Diferente de "pulada": dose não resolvida nunca vira `skipped`
   *  sozinha por tempo (decisão nº11.5). */
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
};

/** Quantas doses o dia tinha e quantas foram confirmadas. Pulada conta no total, não no numerador. */
export type DailyAdherence = {
  /** ISO `YYYY-MM-DD`. */
  day: string;
  total: number;
  confirmed: number;
};

export interface DoseScheduleRepository extends Repository<DoseSchedule> {
  findByPrescription(prescriptionId: string): Promise<DoseSchedule[]>;
  /**
   * Todas as doses do dia, resolvidas ou não. Diferente de `findPendingForDay`, que serve à tela
   * de alarme: a agenda do dia precisa mostrar também o que já foi tomado, senão o progresso não
   * tem denominador e a lista encolhe conforme a pessoa confirma.
   */
  findForDay(referenceDate: string): Promise<DoseScheduleWithStatus[]>;
  /**
   * O mesmo, para uma faixa de instantes — a agenda do calendário, que mostra muitos dias de uma
   * vez. Uma consulta por dia faria a tela ficar mais lenta a cada dia visível.
   */
  findBetween(startTimestamp: string, endTimestamp: string): Promise<DoseScheduleWithStatus[]>;
  /**
   * Doses agendadas e confirmadas por dia, no intervalo (ISO `YYYY-MM-DD`, ambos inclusive).
   * Dias sem dose nenhuma simplesmente não aparecem — quem chama decide se isso é "100%" ou
   * "nada a mostrar", porque a resposta muda conforme o gráfico.
   */
  findDailyAdherence(fromDate: string, toDate: string): Promise<DailyAdherence[]>;
  /**
   * Doses do dia (`referenceDate`) ainda sem IntakeLog resolutivo (nenhum "confirmed"/"skipped"
   * mais recente) — inclui atrasadas do próprio dia. Alimenta a tela dedicada de gerenciamento
   * de dose: dose que disparou o alarme/notificação + demais pendentes do dia.
   */
  findPendingForDay(referenceDate: string): Promise<DoseSchedule[]>;
  /**
   * Marca o único adiamento permitido (`snoozeCount` 0 → 1). Devolve `true` só quando **este**
   * chamador gastou o adiamento; `false` quando ele já tinha sido gasto.
   *
   * O retorno importa: sem ele a recusa acontecia calada no banco e quem chamava seguia agendando
   * o lembrete assim mesmo — cinco toques em "Adiar" viravam cinco lembretes.
   */
  incrementSnoozeCount(doseScheduleId: string): Promise<boolean>;
  /**
   * Remove os horários **futuros** de uma prescrição, para regerar depois de a posologia mudar.
   * Só os futuros: apagar os passados destruiria o histórico de quando a dose deveria ter
   * acontecido, que é o que o registro de ingestão referencia.
   */
  deleteUpcoming(prescriptionId: string, fromTimestamp: string): Promise<void>;
}
