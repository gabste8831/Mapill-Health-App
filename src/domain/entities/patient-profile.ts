import type { SyncableEntity } from "./syncable";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;

/**
 * "Fichinha médica auxiliar" do paciente — não é um dado clínico controlado por prescrição,
 * é preenchido livremente pelo próprio usuário pra ter sempre à mão (ex: tipo sanguíneo).
 * Um único registro por conta/dispositivo (não sincronizável entre pacientes diferentes).
 */
export type PatientProfile = SyncableEntity & {
  firstName: string;
  lastName: string;
  /** Caminho local do arquivo — nunca URL remota direta, ver `photoSyncOptOut`. */
  photoUri: string | null;
  bloodType: BloodType;
  /** Texto livre, um item por alergia — sem validação clínica, é o próprio paciente relatando. */
  allergies: string[];
  /** Campo aberto pra qualquer outra informação que o paciente ache relevante ter registrada. */
  notes: string | null;
  /**
   * LGPD: dado sensível de saúde. Se true, a foto de perfil nunca sobe pro Supabase Storage
   * mesmo com backup habilitado na conta — fica só no dispositivo.
   */
  photoSyncOptOut: boolean;
};
