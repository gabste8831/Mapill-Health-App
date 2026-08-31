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
export async function importarCatalogoCmed(): Promise<void> {
  const database = getDatabase();

  const existente = await database.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM cmed_entries",
  );
  if ((existente?.total ?? 0) > 0) return;

  // `require` e não `import`: o Metro embute o JSON no bundle, e o import estático o carregaria em
  // toda abertura mesmo quando a importação não vai acontecer.
  const registros = require("@/assets/data/cmed.json") as CmedJson[];

  /**
   * Tudo numa transação só. São ~7 mil inserções em `cmed_entries` e ~14 mil em `cmed_eans`: fora
   * de transação, cada uma pagaria um commit em disco, e o que leva segundos passaria a levar
   * minutos.
   */
  await database.withTransactionAsync(async () => {
    for (const registro of registros) {
      const resultado = await database.runAsync(
        `INSERT INTO cmed_entries (name, active_ingredient, strength, prescription_requirement, search)
         VALUES (?, ?, ?, ?, ?)`,
        [
          registro.n,
          registro.s,
          registro.d,
          registro.r,
          // Nome e princípio ativo na mesma coluna: quem procura "losartana" pode estar digitando o
          // nome comercial ou a substância, e o app não tem como saber qual dos dois.
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
