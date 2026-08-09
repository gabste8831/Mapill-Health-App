import type { BloodType, PatientProfile } from "../../domain/entities/patient-profile";
import type { PatientProfileRepository as PatientProfileRepositoryPort } from "../../domain/ports/patient-profile-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type PatientProfileRow = SyncableRow & {
  first_name: string;
  last_name: string;
  photo_uri: string | null;
  blood_type: string | null;
  /** JSON array serializado — não há tabela própria de alergias, é texto livre do paciente. */
  allergies: string;
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
      photoUri: row.photo_uri,
      bloodType: row.blood_type as BloodType,
      allergies: JSON.parse(row.allergies) as string[],
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
      photo_uri: entity.photoUri,
      blood_type: entity.bloodType,
      allergies: JSON.stringify(entity.allergies),
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
