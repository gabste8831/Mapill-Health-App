import type { Medication } from "../entities/medication";
import type { Repository } from "./repository";

export interface MedicationRepository extends Repository<Medication> {
  /** Usado no fluxo de escanear código de barras. */
  findByEan(ean: string): Promise<Medication | null>;
}
