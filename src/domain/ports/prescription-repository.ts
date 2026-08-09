import type { Prescription } from "../entities/prescription";
import type { Repository } from "./repository";

export interface PrescriptionRepository extends Repository<Prescription> {
  findByMedication(medicationId: string): Promise<Prescription[]>;
  /** Tratamentos ativos: `endDate` nulo ou no futuro em relação a `referenceDate`. */
  findActive(referenceDate: string): Promise<Prescription[]>;
}
