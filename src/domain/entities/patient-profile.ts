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
  /** Como o paciente digitou. Não é separado em nome/sobrenome — ver migration 007. */
  fullName: string;
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
 * O que o paciente informa na ficha. Fica de fora o que o sistema controla — id e metadados de
 * sincronização — e o `photoSyncOptOut`, que é uma escolha de privacidade feita em outro lugar,
 * não um campo do formulário. Derivado de `PatientProfile` pra não sair de sincronia quando um
 * campo for adicionado à entidade.
 */
export type PatientProfileDraft = Omit<
  PatientProfile,
  keyof SyncableEntity | "photoSyncOptOut"
>;

/**
 * Primeiro nome, para saudação ("Olá, Ana"). Derivado na hora de exibir em vez de guardado:
 * o que o paciente digitou continua sendo a única versão salva.
 */
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
