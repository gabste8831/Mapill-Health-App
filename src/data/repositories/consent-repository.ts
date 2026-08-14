import type { ConsentRecord } from "../../domain/entities/consent";
import type { ConsentRepository as ConsentRepositoryPort } from "../../domain/ports/consent-repository";
import { SqliteRepository, type SyncableRow } from "./sqlite-repository";

type ConsentRecordRow = SyncableRow & {
  terms_version: string;
  accepted_at: string;
};

export class ConsentRepository
  extends SqliteRepository<ConsentRecord, ConsentRecordRow>
  implements ConsentRepositoryPort
{
  protected readonly tableName = "consent_records";

  protected toEntity(row: ConsentRecordRow): ConsentRecord {
    return {
      id: row.id,
      termsVersion: row.terms_version,
      acceptedAt: row.accepted_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
      deletedAt: row.deleted_at,
    };
  }

  protected toRow(entity: ConsentRecord): ConsentRecordRow {
    return {
      id: entity.id,
      terms_version: entity.termsVersion,
      accepted_at: entity.acceptedAt,
      updated_at: entity.updatedAt,
      synced_at: entity.syncedAt,
      deleted_at: entity.deletedAt,
    };
  }

  async getCurrent(): Promise<ConsentRecord | null> {
    // Sempre o consentimento mais recente — se houver mais de um (ex: reconsentiu após troca
    // de versão dos termos), só o último importa pra liberar o uso do app.
    const row = await this.database.getFirstAsync<ConsentRecordRow>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY accepted_at DESC LIMIT 1`,
    );
    return row ? this.toEntity(row) : null;
  }
}
