import type { SyncableEntity } from "./syncable";

export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | null;

/**
 * Sexo biológico — relevante clinicamente (ex: dosagem, referência de exames), diferente de
 * identidade de gênero, que o Mapill não coleta por não ter uso clínico definido no domínio.
 */
export type BiologicalSex = "male" | "female" | "other" | null;

/**
 * Contato pra acionar em emergência. O paciente pode cadastrar quantos quiser (ver
 * FichaDeSaudeScreen) — cada um é preenchido por completo num popup próprio antes de ser
 * adicionado à lista, então nunca existe um contato salvo pela metade.
 */
export type EmergencyContact = {
  name: string;
  phone: string;
  /** Vínculo com o paciente (ex: "Filha", "Cônjuge", "Vizinho") — texto livre. */
  relationship: string;
};

/**
 * "Fichinha médica auxiliar" do paciente — não é um dado clínico controlado por prescrição,
 * é preenchido livremente pelo próprio usuário pra ter sempre à mão (ex: tipo sanguíneo).
 * Um único registro por conta/dispositivo (não sincronizável entre pacientes diferentes).
 */
export type PatientProfile = SyncableEntity & {
  firstName: string;
  lastName: string;
  /** ISO 8601 (`YYYY-MM-DD`). Obrigatório junto com nome/sobrenome — ver FichaDeSaudeScreen. */
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  /** Caminho local do arquivo — nunca URL remota direta, ver `photoSyncOptOut`. */
  photoUri: string | null;
  bloodType: BloodType;
  /** Texto livre, um item por alergia — sem validação clínica, é o próprio paciente relatando. */
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  /** Campo aberto pra qualquer outra informação que o paciente ache relevante ter registrada. */
  notes: string | null;
  /**
   * LGPD: dado sensível de saúde. Se true, a foto de perfil nunca sobe pro Supabase Storage
   * mesmo com backup habilitado na conta — fica só no dispositivo.
   */
  photoSyncOptOut: boolean;
};

/**
 * O que o paciente informa na ficha. O que o sistema controla — id, metadados de sincronização,
 * foto e o opt-out dela — fica de fora de propósito: uma edição do formulário não pode apagar
 * nada disso. Derivado de `PatientProfile` pra não sair de sincronia quando um campo for
 * adicionado à entidade.
 */
export type PatientProfileDraft = Omit<
  PatientProfile,
  keyof SyncableEntity | "photoUri" | "photoSyncOptOut"
>;
