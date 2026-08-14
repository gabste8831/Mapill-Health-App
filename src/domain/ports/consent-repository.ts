import type { ConsentRecord } from "../entities/consent";
import type { Repository } from "./repository";

export interface ConsentRepository extends Repository<ConsentRecord> {
  /** Único registro ativo — sempre o consentimento mais recente aceito. */
  getCurrent(): Promise<ConsentRecord | null>;
}
