import { getDatabase } from "./database";
import { normalizarBusca } from "../repositories/cmed-catalog-repository";

/**
 * O formato compacto de `assets/data/cmed.json`.
 *
 * Chaves de uma letra porque são 7 mil registros: `{"name":…,"activeIngredient":…}` custaria
 * ~300 KB a mais no bundle só em nomes de campo repetidos. É a única parte do projeto onde
 * abreviação se justifica — o arquivo é gerado por script e lido em um lugar só, logo abaixo.
 */
type CmedJson = {
  /** Nome comercial. */
  n: string;
  /** Substância / princípio ativo. */
  s: string;
  /** Dosagem — "500 MG". */
  d: string;
  /** Requisito de receita, já mapeado da tarja. */
  r: string;
  /** Códigos de barras. */
  e: string[];
};

/**
 * Carrega o catálogo da CMED no SQLite, uma vez por instalação.
 *
 * **Idempotente por contagem**: se a tabela já tem linhas, não faz nada. É o suficiente porque o
 * arquivo é embutido no app — mudou a base, muda a versão do app, e aí a tabela é recriada por uma
 * migration nova. Não há caso de "importar de novo o mesmo arquivo".
 *
 * Roda **fora** do caminho crítico da abertura: quem chama não espera. A busca por nome é
 * conveniência do cadastro, não pré-requisito — se o catálogo ainda está carregando, o campo
 * simplesmente não sugere nada, e o cadastro manual funciona igual. Bloquear a splash por 7 mil
 * inserções seria pagar um preço visível por um ganho opcional.
 */
/**
 * A importação em curso, quando há uma.
 *
 * Existe para quem **escreve** no banco poder esperar por ela. A importação é assumidamente
 * demorada e roda fora do caminho crítico, mas enquanto ela acontece o banco tem um escritor
 * ocupando espaço — e uma segunda escrita pesada no meio (a sincronização do login, por exemplo)
 * disputa com ela sem necessidade.
 *
 * `null` quando não há importação rodando, que é o caso comum: ela só acontece na primeira abertura.
 */
let importacaoEmCurso: Promise<void> | null = null;

/**
 * Espera a importação da CMED terminar, se houver uma.
 *
 * Resolve na hora quando não há — então chamar isto nunca custa nada depois da primeira abertura.
 */
export function aguardarCatalogoCmed(): Promise<void> {
  return importacaoEmCurso ?? Promise.resolve();
}

export async function importarCatalogoCmed(): Promise<void> {
  // Reusa a execução em curso: duas chamadas concorrentes fariam a mesma importação duas vezes.
  if (importacaoEmCurso !== null) return importacaoEmCurso;
  importacaoEmCurso = executarImportacao().finally(() => {
    importacaoEmCurso = null;
  });
  return importacaoEmCurso;
}

/**
 * Divide a importação em lotes, com uma transação cada.
 *
 * Uma transação única de 21 mil inserções é mais rápida — cada commit custa disco —, mas segura o
 * banco do começo ao fim. Enquanto ela corre, qualquer outra escrita espera ou falha, e na primeira
 * abertura há outra: a sincronização, se a pessoa entrar com o Google nesse intervalo.
 *
 * Em lotes o custo é algumas dezenas de commits em vez de um, o que na prática não se percebe — e
 * entre um lote e outro o banco fica **livre**, então quem precisa escrever encontra a porta aberta
 * em vez de esperar a fila inteira.
 */
const TAMANHO_DO_LOTE = 500;

async function executarImportacao(): Promise<void> {
  const database = getDatabase();

  const existente = await database.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM cmed_entries",
  );
  if ((existente?.total ?? 0) > 0) return;

  // `require` e não `import`: o Metro embute o JSON no bundle, e o import estático o carregaria em
  // toda abertura mesmo quando a importação não vai acontecer.
  const registros = require("@/assets/data/cmed.json") as CmedJson[];

  /**
   * Em lotes transacionados, e não numa transação só.
   *
   * Dentro de cada lote a transação continua sendo o que evita pagar um commit em disco por
   * inserção — sem ela, o que leva segundos levaria minutos. O que muda é o **tamanho do bloqueio**:
   * entre um lote e outro o banco fica livre, e quem mais precisa escrever não fica esperando 21 mil
   * inserções terminarem.
   */
  for (let i = 0; i < registros.length; i += TAMANHO_DO_LOTE) {
    const lote = registros.slice(i, i + TAMANHO_DO_LOTE);

    await database.withTransactionAsync(async () => {
      for (const registro of lote) {
        const resultado = await database.runAsync(
          `INSERT INTO cmed_entries (name, active_ingredient, strength, prescription_requirement, search)
           VALUES (?, ?, ?, ?, ?)`,
          [
            registro.n,
            registro.s,
            registro.d,
            registro.r,
            // Nome e princípio ativo na mesma coluna: quem procura "losartana" pode estar digitando
            // o nome comercial ou a substância, e o app não tem como saber qual dos dois.
            normalizarBusca(`${registro.n} ${registro.s}`),
          ],
        );

        for (const ean of registro.e) {
          // `OR IGNORE`: o mesmo EAN pode aparecer em dois registros da base original, e a chave
          // primária recusaria o segundo. Perder o vínculo duplicado é irrelevante — o primeiro já
          // leva ao produto certo.
          await database.runAsync(
            "INSERT OR IGNORE INTO cmed_eans (ean, entry_id) VALUES (?, ?)",
            [ean, resultado.lastInsertRowId],
          );
        }
      }
    });
  }
}
