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
 * ## `busy_timeout = 15000`
 *
 * Mesmo com WAL, duas **escritas** simultâneas ainda disputam. Sem timeout o SQLite falha
 * imediatamente; com ele, a segunda espera pela primeira em vez de desistir.
 *
 * Quinze segundos, e não cinco: a importação do catálogo é uma transação única de ~21 mil
 * inserções, e num aparelho lento ela passa de cinco. Esperar mais é sempre melhor que falhar —
 * quem espera termina a operação, quem falha perde o dado.
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
PRAGMA busy_timeout = 15000;
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

/**
 * A preparação inteira da abertura — migrations e o que mais precisa estar pronto antes da tela.
 *
 * Memoizada como um todo, e não só nas partes: `initializeDatabase()` já era, mas o `.then()` que
 * a segue não. Em desenvolvimento o React monta o efeito duas vezes, e a segunda montagem recebia
 * a promessa das migrations já cumprida e seguia direto para o `.then()` — duas preparações
 * correndo juntas, escrevendo no mesmo banco. Memoizar aqui faz a segunda montagem esperar pela
 * primeira em vez de repeti-la.
 */
let preparacaoDaAbertura: Promise<void> | null = null;

export function prepararBanco(depoisDasMigrations: () => Promise<void>): Promise<void> {
  if (!preparacaoDaAbertura) {
    preparacaoDaAbertura = initializeDatabase().then(depoisDasMigrations);
  }
  return preparacaoDaAbertura;
}

/**
 * Roda várias escritas como uma só: ou todas valem, ou nenhuma vale.
 *
 * ## Onde usar, e onde não
 *
 * Só quando **várias** escritas precisam existir juntas — o cadastro de um medicamento, que grava
 * remédio, tratamento, estoque e um horário por dose; a baixa de estoque, que insere o ajuste e
 * atualiza a quantidade. Escrita avulsa **não** entra aqui: o SQLite já a executa atomicamente, e
 * embrulhá-la em `BEGIN`/`COMMIT` não acrescenta garantia nenhuma.
 *
 * Essa distinção não é preciosismo. Toda operação do expo-sqlite — leitura inclusive — é um
 * statement preparado, executado e finalizado (`prepareAsync` → `executeAsync` → `finalizeAsync`),
 * e o app dispara operações em paralelo em vários pontos: a Home faz cinco leituras de uma vez, o
 * reagendamento de avisos faz três. Cada transação aberta é uma janela em que esses statements
 * podem esbarrar na trava, e o erro sai como
 * `NativeStatement.finalizeAsync ... database is locked`.
 *
 * Uma tentativa anterior transformou **toda** escrita do app em transação, na esperança de
 * serializar tudo. O efeito foi o oposto: numa base com dados, a sincronização passou a abrir
 * centenas de transações enquanto a pessoa usava o app, e confirmar uma dose falhava a cada toque.
 * Menos transações é mais seguro que mais, e é por isso que esta função tem uso restrito.
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
