import type * as SQLite from "expo-sqlite";

import { MIGRATION_001_INIT } from "./001-init";
import { MIGRATION_002_DOMAIN_EXTENSIONS } from "./002-domain-extensions";

type Migration = {
  version: number;
  sql: string;
};

/** Ordem de aplicação — nunca reordenar ou editar uma migration já publicada, só adicionar. */
const MIGRATIONS: Migration[] = [
  { version: 1, sql: MIGRATION_001_INIT },
  { version: 2, sql: MIGRATION_002_DOMAIN_EXTENSIONS },
];

/**
 * Aplica, em ordem, toda migration com versão maior que `PRAGMA user_version` atual.
 * Idempotente entre execuções: se o banco já está na última versão, não faz nada.
 */
export async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = row?.user_version ?? 0;

  const pending = MIGRATIONS.filter((migration) => migration.version > currentVersion).sort(
    (a, b) => a.version - b.version,
  );

  for (const migration of pending) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(migration.sql);
    });
    await database.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}
