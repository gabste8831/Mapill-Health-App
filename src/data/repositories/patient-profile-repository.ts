import type { BiologicalSex, BloodType, PatientProfile } from "../../domain/entities/patient-profile";
import type { PatientProfileRepository as PatientProfileRepositoryPort } from "../../domain/ports/patient-profile-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type PatientProfileRow = SyncableRow & {
  first_name: string;
  last_name: string;
  /** Nullable no schema por restrição de ALTER TABLE — obrigatório na camada de apresentação. */
  date_of_birth: string | null;
  biological_sex: string | null;
  photo_uri: string | null;
  blood_type: string | null;
  /** JSON array serializado — não há tabela própria de alergias, é texto livre do paciente. */
  allergies: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  notes: string | null;
  photo_sync_opt_out: number;
};

export class PatientProfileRepository
  extends SqliteRepository<PatientProfile, PatientProfileRow>
  implements PatientProfileRepositoryPort
{
  protected readonly tableName = "patient_profiles";

  protected toEntity(row: PatientProfileRow): PatientProfile {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      // Registros antigos (pré-migration 003) podem não ter data de nascimento salva — a UI
      // trata isso como perfil incompleto e pede o dado de novo, não infere nada.
      dateOfBirth: row.date_of_birth ?? "",
      biologicalSex: row.biological_sex as BiologicalSex,
      photoUri: row.photo_uri,
      bloodType: row.blood_type as BloodType,
      allergies: JSON.parse(row.allergies) as string[],
      // Os três campos do contato são gravados juntos (ver toRow) — se o nome existe, o resto
      // também existe, então basta checar um pra reconstruir o objeto ou null.
      emergencyContact: row.emergency_contact_name
        ? {
            name: row.emergency_contact_name,
            phone: row.emergency_contact_phone ?? "",
            relationship: row.emergency_contact_relationship ?? "",
          }
        : null,
      notes: row.notes,
      photoSyncOptOut: row.photo_sync_opt_out === 1,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: PatientProfile): PatientProfileRow {
    return {
      id: entity.id,
      first_name: entity.firstName,
      last_name: entity.lastName,
      date_of_birth: entity.dateOfBirth,
      biological_sex: entity.biologicalSex,
      photo_uri: entity.photoUri,
      blood_type: entity.bloodType,
      allergies: JSON.stringify(entity.allergies),
      emergency_contact_name: entity.emergencyContact?.name ?? null,
      emergency_contact_phone: entity.emergencyContact?.phone ?? null,
      emergency_contact_relationship: entity.emergencyContact?.relationship ?? null,
      notes: entity.notes,
      photo_sync_opt_out: entity.photoSyncOptOut ? 1 : 0,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async getCurrent(): Promise<PatientProfile | null> {
    // Conta única por paciente: sempre o registro mais recente, nunca uma lista pra escolher.
    const row = await this.database.getFirstAsync<PatientProfileRow>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1`,
    );
    return row ? this.toEntity(row) : null;
  }
}
