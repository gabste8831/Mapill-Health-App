import type * as SQLite from "expo-sqlite";

import { MIGRATION_001_INIT } from "./001-init";
import { MIGRATION_002_DOMAIN_EXTENSIONS } from "./002-domain-extensions";
import { MIGRATION_003_PATIENT_DATE_OF_BIRTH } from "./003-patient-date-of-birth";
import { MIGRATION_004_PATIENT_SEX_AND_EMERGENCY_CONTACT } from "./004-patient-sex-and-emergency-contact";
import { MIGRATION_005_EMERGENCY_CONTACTS_LIST } from "./005-emergency-contacts-list";
import { MIGRATION_006_CONSENT_RECORDS } from "./006-consent-records";
import { MIGRATION_007_PATIENT_FULL_NAME } from "./007-patient-full-name";
import { MIGRATION_008_PRESCRIPTION_SCHEDULE } from "./008-prescription-schedule";
import { MIGRATION_009_MEDICATION_FORM_AND_ATTACHMENTS } from "./009-medication-form-and-attachments";
import { MIGRATION_010_PRESCRIPTION_REQUIREMENT } from "./010-prescription-requirement";
import { MIGRATION_011_PRESCRIPTION_INTAKE_INSTRUCTIONS } from "./011-prescription-intake-instructions";
import { MIGRATION_012_DOSE_SCHEDULE_AMOUNT } from "./012-dose-schedule-amount";
import { MIGRATION_013_PRESCRIPTION_INTAKE_NOTE_AND_RENEWAL } from "./013-prescription-intake-note-and-renewal";
import { MIGRATION_014_APPOINTMENT_PLACE_AND_PROFESSIONAL } from "./014-appointment-place-and-professional";

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
  { version: 6, sql: MIGRATION_006_CONSENT_RECORDS },
  { version: 7, sql: MIGRATION_007_PATIENT_FULL_NAME },
  { version: 8, sql: MIGRATION_008_PRESCRIPTION_SCHEDULE },
  { version: 9, sql: MIGRATION_009_MEDICATION_FORM_AND_ATTACHMENTS },
  { version: 10, sql: MIGRATION_010_PRESCRIPTION_REQUIREMENT },
  { version: 11, sql: MIGRATION_011_PRESCRIPTION_INTAKE_INSTRUCTIONS },
  { version: 12, sql: MIGRATION_012_DOSE_SCHEDULE_AMOUNT },
  { version: 13, sql: MIGRATION_013_PRESCRIPTION_INTAKE_NOTE_AND_RENEWAL },
  { version: 14, sql: MIGRATION_014_APPOINTMENT_PLACE_AND_PROFESSIONAL },
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
