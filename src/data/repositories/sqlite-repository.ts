import type * as SQLite from "expo-sqlite";

import { getDatabase } from "../local/database";
import type { Repository } from "../../domain/ports/repository";
import type { SyncableEntity } from "../../domain/entities/syncable";

/** Linha crua de qualquer tabela sincronizável — nomes de coluna em snake_case. */
export type SyncableRow = Record<string, unknown> & {
  id: string;
  updated_at: string;
  synced_at: string | null;
  deleted_at: string | null;
};

/**
 * Base comum a todo repositório SQLite: implementa o CRUD genérico de `Repository<T>` a
 * partir só do nome da tabela e dos mapeadores linha↔entidade — cada repositório concreto só
 * precisa declarar isso e adicionar os métodos extras do seu port específico.
 */
export abstract class SqliteRepository<TEntity extends SyncableEntity, TRow extends SyncableRow>
  implements Repository<TEntity>
{
  protected abstract readonly tableName: string;
  protected abstract toEntity(row: TRow): TEntity;
  /** Deve retornar TODAS as colunas da linha, inclusive as herdadas de SyncableEntity. */
  protected abstract toRow(entity: TEntity): TRow;

  protected get database(): SQLite.SQLiteDatabase {
    return getDatabase();
  }

  async findById(id: string): Promise<TEntity | null> {
    const row = await this.database.getFirstAsync<TRow>(
      `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<TEntity[]> {
    const rows = await this.database.getAllAsync<TRow>(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`,
    );
    return rows.map((row) => this.toEntity(row));
  }

  async save(entity: TEntity): Promise<void> {
    const row = this.toRow(entity);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => "?").join(", ");
    const updateAssignments = columns
      .filter((column) => column !== "id")
      .map((column) => `${column} = excluded.${column}`)
      .join(", ");

    await this.database.runAsync(
      `INSERT INTO ${this.tableName} (${columns.join(", ")})
       VALUES (${placeholders})
       ON CONFLICT(id) DO UPDATE SET ${updateAssignments}`,
      columns.map((column) => row[column] as SQLite.SQLiteBindValue),
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.database.runAsync(
      `UPDATE ${this.tableName} SET deleted_at = ?, updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), new Date().toISOString(), id],
    );
  }
}
