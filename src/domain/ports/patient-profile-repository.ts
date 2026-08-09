import type { PatientProfile } from "../entities/patient-profile";
import type { Repository } from "./repository";

export interface PatientProfileRepository extends Repository<PatientProfile> {
  /** Conta única por paciente — não há seleção de perfil, só existe um registro ativo. */
  getCurrent(): Promise<PatientProfile | null>;
}
