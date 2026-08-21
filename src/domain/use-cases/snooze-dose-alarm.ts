import type { DoseScheduleRepository } from "../ports/dose-schedule-repository";

export class DoseAlarmAlreadySnoozedError extends Error {
  constructor() {
    super("Este alarme já foi adiado uma vez, e não é possível adiar de novo.");
    this.name = "DoseAlarmAlreadySnoozedError";
  }
}

/**
 * Adia o alarme de uma dose em 5 minutos. Regra do domínio: no máximo um adiamento por dose
 * (o alarme toca no máximo duas vezes) — depois disso o paciente precisa confirmar, marcar
 * como não tomada, ou usar "ignorar por agora" (vira IntakeLog "deferred").
 */
export class SnoozeDoseAlarm {
  constructor(private readonly doseScheduleRepository: DoseScheduleRepository) {}

  async execute(doseSchedule: { id: string; snoozeCount: 0 | 1 }): Promise<void> {
    if (doseSchedule.snoozeCount === 1) {
      throw new DoseAlarmAlreadySnoozedError();
    }

    await this.doseScheduleRepository.incrementSnoozeCount(doseSchedule.id);
  }
}
