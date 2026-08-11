import type * as SQLite from "expo-sqlite";

import { MIGRATION_001_INIT } from "./001-init";
import { MIGRATION_002_DOMAIN_EXTENSIONS } from "./002-domain-extensions";
import { MIGRATION_003_PATIENT_DATE_OF_BIRTH } from "./003-patient-date-of-birth";
import { MIGRATION_004_PATIENT_SEX_AND_EMERGENCY_CONTACT } from "./004-patient-sex-and-emergency-contact";
import { MIGRATION_005_EMERGENCY_CONTACTS_LIST } from "./005-emergency-contacts-list";

type Migration = {
  version: number;
  sql: string;
};

/** Ordem de aplicação — nunca reordenar ou editar uma migration já publicada, só adicionar. */
const MIGRATIONS: Migration[] = [
  { version: 1, sql: MIGRATION_001_INIT },
  { version: 2, sql: MIGRATION_002_DOMAIN_EXTENSIONS },
  { version: 3, sql: MIGRATION_003_PATIENT_DATE_OF_BIRTH },
  { version: 4, sql: MIGRATION_004_PATIENT_SEX_AND_EMERGENCY_CONTACT },
  { version: 5, sql: MIGRATION_005_EMERGENCY_CONTACTS_LIST },
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
