import type { IntakeLog } from "../entities/intake-log";
import type { Repository } from "./repository";

export interface IntakeLogRepository extends Repository<IntakeLog> {
  findByDoseSchedule(doseScheduleId: string): Promise<IntakeLog[]>;
}
