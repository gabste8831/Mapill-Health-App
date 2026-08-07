import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "mapill.db";

let database: SQLite.SQLiteDatabase | null = null;

/** Sempre passar por um repositório em src/data/repositories — nenhuma tela chama isso direto. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return database;
}
