import type * as SQLite from "expo-sqlite";

import { escreverEmTransacao } from "./database";
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
 * Roda **antes** de a tela ser liberada, e quem chama espera.
 *
 * Já foi assíncrona, para não segurar a splash. A premissa era que 21 mil inserções custariam
 * caro — e ela não se sustentou na medição: o arquivo tem 6.992 registros e 13.810 códigos de
 * barras, e as 20.802 inserções levam ~100 ms numa transação. O custo real é de uma abertura só,
 * porque a segunda chamada sai na primeira linha, vendo a tabela cheia.
 *
 * O que a versão assíncrona custava era muito pior: ela escrevia ao mesmo tempo que a restauração
 * dos dados na nuvem, e as duas transações se atropelavam na mesma conexão — `database is locked`
 * ao entrar com uma conta que já tinha dados, e `cannot start a transaction within a transaction`
 * ao salvar qualquer coisa nesse intervalo. Esperar remove a concorrência em vez de administrá-la.
 */
/**
 * A importação em curso, quando há uma.
 *
 * Só serve para duas chamadas simultâneas reusarem a mesma execução em vez de importarem duas
 * vezes. `null` no caso comum: a importação só acontece na primeira abertura.
 */
let importacaoEmCurso: Promise<void> | null = null;

export async function importarCatalogoCmed(): Promise<void> {
  // Reusa a execução em curso: duas chamadas concorrentes fariam a mesma importação duas vezes.
  if (importacaoEmCurso !== null) return importacaoEmCurso;
  importacaoEmCurso = executarImportacao().finally(() => {
    importacaoEmCurso = null;
  });
  return importacaoEmCurso;
}

async function executarImportacao(): Promise<void> {
  /**
   * A contagem roda **dentro** da mesma transação que insere, e não antes dela.
   *
   * Fora, era uma janela aberta: duas chamadas quase simultâneas contavam zero as duas, e as duas
   * seguiam para importar. `importacaoEmCurso` não fecha essa janela sozinho — em desenvolvimento o
   * React monta o efeito duas vezes, e a segunda chamada chegava com a promessa da primeira já
   * cumprida. Uma transação escrevia enquanto a outra tentava, e o erro saía como
   * `NativeStatement.finalizeAsync ... database is locked` antes mesmo da tela de login.
   *
   * Dentro da transação a decisão e a escrita são atômicas: a segunda só chega aqui depois de a
   * primeira ter terminado, e aí a contagem já não é zero.
   */
  await escreverEmTransacao(async (transacao) => {
    const existente = await transacao.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM cmed_entries",
    );
    if ((existente?.total ?? 0) > 0) return;

    await inserirCatalogo(transacao);
  });
}

/**
 * As 20.802 inserções, em poucas instruções em vez de uma por linha.
 *
 * **É aqui que estava o tempo.** Uma chamada de `runAsync` por registro são 20.802 idas e voltas
 * pela ponte entre o JavaScript e o código nativo, e cada uma custa muito mais que a inserção em
 * si — no aparelho isso passava de trinta segundos. O SQLite nunca foi o gargalo: as mesmas
 * inserções levam ~60 ms quando agrupadas.
 *
 * O agrupamento exige o `id` **explícito**, e é por isso que ele é calculado aqui em vez de vir do
 * `lastInsertRowId`: era justamente a leitura desse valor, um por linha, que obrigava a inserir uma
 * de cada vez. A coluna é `INTEGER PRIMARY KEY AUTOINCREMENT` e a tabela está vazia (a transação
 * garante), então numerar a partir de 1 é seguro e determinístico.
 *
 * Os lotes existem por causa do limite de variáveis por instrução do SQLite (999 no padrão): 150
 * registros × 5 colunas = 750 parâmetros, com folga.
 */
async function inserirCatalogo(transacao: SQLite.SQLiteDatabase): Promise<void> {
  // `require` e não `import`: o Metro embute o JSON no bundle, e o import estático o carregaria em
  // toda abertura mesmo quando a importação não vai acontecer.
  const registros = require("@/assets/data/cmed.json") as CmedJson[];

  const REGISTROS_POR_INSTRUCAO = 150;
  const EANS_POR_INSTRUCAO = 400;

  for (let i = 0; i < registros.length; i += REGISTROS_POR_INSTRUCAO) {
    const lote = registros.slice(i, i + REGISTROS_POR_INSTRUCAO);
    const valores: (string | number)[] = [];

    for (const [posicao, registro] of lote.entries()) {
      valores.push(
        i + posicao + 1,
        registro.n,
        registro.s,
        registro.d,
        registro.r,
        // Nome e princípio ativo na mesma coluna: quem procura "losartana" pode estar digitando o
        // nome comercial ou a substância, e o app não tem como saber qual dos dois.
        normalizarBusca(`${registro.n} ${registro.s}`),
      );
    }

    await transacao.runAsync(
      `INSERT INTO cmed_entries (id, name, active_ingredient, strength, prescription_requirement, search)
       VALUES ${lote.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}`,
      valores,
    );
  }

  /** Os códigos de barras, já sabendo o `id` de cada registro pela posição dele na lista. */
  const eans: (string | number)[] = [];
  for (const [posicao, registro] of registros.entries()) {
    for (const ean of registro.e) eans.push(ean, posicao + 1);
  }

  for (let i = 0; i < eans.length; i += EANS_POR_INSTRUCAO * 2) {
    const lote = eans.slice(i, i + EANS_POR_INSTRUCAO * 2);
    // `OR IGNORE`: o mesmo EAN pode aparecer em dois registros da base original, e a chave primária
    // recusaria o segundo. Perder o vínculo duplicado é irrelevante — o primeiro já leva ao produto
    // certo.
    await transacao.runAsync(
      `INSERT OR IGNORE INTO cmed_eans (ean, entry_id)
       VALUES ${Array.from({ length: lote.length / 2 }, () => "(?, ?)").join(", ")}`,
      lote,
    );
  }
}
