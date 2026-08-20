import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";

export const DATABASE_NAME = "mapill.db";

let database: SQLite.SQLiteDatabase | null = null;
let migrationsReady: Promise<void> | null = null;

/** Sempre passar por um repositório em src/data/repositories — nenhuma tela chama isso direto. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return database;
}

/** Roda na abertura do app, antes de qualquer repositório. Memoizado: reusa a mesma promise. */
export function initializeDatabase(): Promise<void> {
  if (!migrationsReady) {
    migrationsReady = runMigrations(getDatabase());
  }
  return migrationsReady;
}
