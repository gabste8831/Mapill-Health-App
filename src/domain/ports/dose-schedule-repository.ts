import type { DoseSchedule } from "../entities/dose-schedule";
import type { Repository } from "./repository";

export interface DoseScheduleRepository extends Repository<DoseSchedule> {
  findByPrescription(prescriptionId: string): Promise<DoseSchedule[]>;
  /**
   * Doses do dia (`referenceDate`) ainda sem IntakeLog resolutivo (nenhum "confirmed"/"skipped"
   * mais recente) — inclui atrasadas do próprio dia. Alimenta a tela dedicada de gerenciamento
   * de dose: dose que disparou o alarme/notificação + demais pendentes do dia.
   */
  findPendingForDay(referenceDate: string): Promise<DoseSchedule[]>;
  /** Marca o único adiamento permitido (`snoozeCount` 0 → 1) — rejeitar se já estiver em 1. */
  incrementSnoozeCount(doseScheduleId: string): Promise<void>;
  /**
   * Remove os horários **futuros** de uma prescrição, para regerar depois de a posologia mudar.
   * Só os futuros: apagar os passados destruiria o histórico de quando a dose deveria ter
   * acontecido, que é o que o registro de ingestão referencia.
   */
  deleteUpcoming(prescriptionId: string, fromTimestamp: string): Promise<void>;
}
