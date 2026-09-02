import type { BiologicalSex, BloodType, EmergencyContact, PatientProfile } from "../../domain/entities/patient-profile";
import type { PatientProfileRepository as PatientProfileRepositoryPort } from "../../domain/ports/patient-profile-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type PatientProfileRow = SyncableRow & {
  full_name: string;
  /** Nullable no schema por restrição de ALTER TABLE — obrigatório na camada de apresentação. */
  date_of_birth: string | null;
  biological_sex: string | null;
  photo_uri: string | null;
  blood_type: string | null;
  /** JSON array serializado — não há tabela própria de alergias, é texto livre do paciente. */
  allergies: string;
  /**
   * JSON array serializado (migration 005) — as colunas soltas de um contato único (migration
   * 004) ficaram pra trás, sem uso; não fazem mais parte do mapeamento.
   */
  emergency_contacts: string;
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
      fullName: row.full_name,
      // Registros antigos (pré-migration 003) podem não ter data de nascimento salva — a UI
      // trata isso como perfil incompleto e pede o dado de novo, não infere nada.
      dateOfBirth: row.date_of_birth ?? "",
      biologicalSex: row.biological_sex as BiologicalSex,
      photoUri: row.photo_uri,
      bloodType: row.blood_type as BloodType,
      allergies: JSON.parse(row.allergies) as string[],
      emergencyContacts: JSON.parse(row.emergency_contacts) as EmergencyContact[],
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
      full_name: entity.fullName,
      /**
       * String vazia volta a ser `null` — **ausência é `null`, nunca `""`**.
       *
       * A entidade usa `""` para "não preenchido" porque a camada de apresentação trabalha com
       * campos de texto, e `fromRow` faz essa conversão na leitura. Gravar de volta sem desfazê-la
       * guardava `""` numa coluna de data, o que o SQLite aceita e o Postgres não: a sincronização
       * quebrava com `invalid input syntax for type date: ""`.
       *
       * O erro só aparecia no push, longe da causa — e derrubava a sincronização inteira do
       * usuário, porque o lote é recusado por completo.
       */
      date_of_birth: entity.dateOfBirth === "" ? null : entity.dateOfBirth,
      biological_sex: entity.biologicalSex,
      photo_uri: entity.photoUri,
      blood_type: entity.bloodType,
      allergies: JSON.stringify(entity.allergies),
      emergency_contacts: JSON.stringify(entity.emergencyContacts),
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
