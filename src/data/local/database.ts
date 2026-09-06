import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";

export const DATABASE_NAME = "mapill.db";

let database: SQLite.SQLiteDatabase | null = null;
let migrationsReady: Promise<void> | null = null;

/**
 * O que o banco precisa saber antes da primeira escrita.
 *
 * ## `journal_mode = WAL`
 *
 * No modo padrão (`DELETE`), o SQLite permite **um escritor por vez** e recusa o segundo na hora,
 * com `database is locked`. O WAL separa leitura de escrita: leitores não bloqueiam o escritor, e o
 * banco aguenta concorrência real em vez de recusá-la.
 *
 * ## `busy_timeout = 5000`
 *
 * Mesmo com WAL, duas **escritas** simultâneas ainda disputam. Sem timeout o SQLite falha
 * imediatamente; com ele, a segunda espera até 5 s pela primeira em vez de desistir. Cinco segundos
 * é folgado para o que este app escreve, e curto o bastante para não parecer travamento.
 *
 * ## Por que isto apareceu só agora
 *
 * O catálogo da CMED (21 mil inserções) roda em segundo plano na primeira abertura, de propósito —
 * ele não pode ficar entre a pessoa e a Home. Enquanto ele escrevia, nada mais tentava escrever ao
 * mesmo tempo. Isso mudou quando a **sincronização passou a rodar no login** (06/09): as duas
 * caíram no mesmo instante, e três erros apareceram de uma vez — a importação da CMED, o push e o
 * pull, todos com `database is locked`.
 *
 * O defeito era latente desde sempre: qualquer usuário que tocasse "Entrar com o Google" durante a
 * primeira importação encontraria o mesmo, e a única razão de nunca ter aparecido é que ninguém
 * tinha feito exatamente isso.
 */
const PRAGMAS_DE_ABERTURA = `
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
`;

/** Sempre passar por um repositório em src/data/repositories — nenhuma tela chama isso direto. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DATABASE_NAME);
    /**
     * Síncrono, e na mesma função que abre: os PRAGMAs precisam valer para **toda** consulta, e
     * qualquer coisa assíncrona aqui abriria uma janela em que a primeira escrita chega antes deles.
     */
    database.execSync(PRAGMAS_DE_ABERTURA);
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
