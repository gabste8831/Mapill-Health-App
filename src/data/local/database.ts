import * as SQLite from "expo-sqlite";

import { runMigrations } from "./migrations";

export const DATABASE_NAME = "mapill.db";

let database: SQLite.SQLiteDatabase | null = null;
let migrationsReady: Promise<void> | null = null;

/**
 * O que o banco precisa saber antes da primeira escrita.
 *
 * `WAL` porque no modo padrao o SQLite permite um escritor por vez e recusa o segundo na hora, com
 * `database is locked`. Ele separa leitura de escrita, e o banco aguenta concorrencia real.
 *
 * `busy_timeout` porque mesmo com WAL duas escritas ainda disputam, e sem ele a segunda falha em
 * vez de esperar. Quinze segundos e nao cinco: a importacao do catalogo e uma transacao unica de
 * ~21 mil insercoes, e num aparelho lento ela passa de cinco.
 *
 * O caso que junta os dois e a sincronizacao no login caindo junto com a importacao da CMED, que
 * roda em segundo plano na primeira abertura.
 */
const PRAGMAS_DE_ABERTURA = `
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 15000;
`;

/** Sempre passar por um repositório em src/data/repositories - nenhuma tela chama isso direto. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    database = SQLite.openDatabaseSync(DATABASE_NAME);
    // Sincrono e na mesma funcao que abre: assincrono abriria uma janela em que a primeira escrita
    // chega antes dos PRAGMAs.
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

/**
 * A preparacao inteira da abertura: migrations e o que mais precisa estar pronto antes da tela.
 *
 * Memoizada como um todo, e nao so nas partes. Em desenvolvimento o React monta o efeito duas
 * vezes, e a segunda montagem recebia as migrations ja cumpridas e seguia direto para o `.then()`:
 * duas preparacoes correndo juntas, escrevendo no mesmo banco.
 */
let preparacaoDaAbertura: Promise<void> | null = null;

export function prepararBanco(depoisDasMigrations: () => Promise<void>): Promise<void> {
  if (!preparacaoDaAbertura) {
    preparacaoDaAbertura = initializeDatabase().then(depoisDasMigrations);
  }
  return preparacaoDaAbertura;
}

/**
 * Roda varias escritas como uma so: ou todas valem, ou nenhuma vale.
 *
 * So quando varias escritas precisam existir juntas, como o cadastro de um medicamento. Escrita
 * avulsa nao entra: o SQLite ja a executa atomicamente, e embrulha-la nao acrescenta garantia.
 *
 * A distincao importa porque cada transacao aberta e uma janela em que os statements paralelos do
 * app esbarram na trava. Transformar toda escrita em transacao ja foi tentado, e o efeito foi o
 * oposto: a sincronizacao abria centenas delas e confirmar uma dose falhava a cada toque.
 */
export async function escreverEmTransacao<T>(
  executar: (database: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const conexao = getDatabase();
  // `withTransactionAsync` devolve void, então o resultado sai pela variável.
  let resultado: T;
  await conexao.withTransactionAsync(async () => {
    resultado = await executar(conexao);
  });
  return resultado!;
}
