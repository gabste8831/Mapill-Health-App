import type { SyncableEntity } from "../entities/syncable";

/** Contrato que toda entidade sincronizável implementa. A implementação real (SQLite, Supabase) fica em src/data. */
export interface Repository<T extends SyncableEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  softDelete(id: string): Promise<void>;
}
