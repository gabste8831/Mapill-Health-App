import { File, Paths } from "expo-file-system";
import { zipSync } from "fflate";
import { Platform } from "react-native";

import { getDatabase } from "../local/database";

/**
 * As tabelas que entram na exportação, com o nome que aparece no arquivo.
 *
 * `cmed_entries` e `cmed_eans` ficam de fora: são o catálogo público da Anvisa embutido no app, e
 * não dado do titular. Exportá-las entregaria 7 mil linhas que a pessoa não forneceu, escondendo o
 * que ela de fato quer ler.
 */
const TABELAS_EXPORTAVEIS: { tabela: string; rotulo: string }[] = [
  { tabela: "patient_profiles", rotulo: "Ficha de saúde" },
  { tabela: "consent_records", rotulo: "Consentimentos" },
  { tabela: "medications", rotulo: "Medicamentos" },
  { tabela: "prescriptions", rotulo: "Tratamentos" },
  { tabela: "dose_schedules", rotulo: "Horários de dose" },
  { tabela: "intake_logs", rotulo: "Registros de ingestão" },
  { tabela: "inventory_items", rotulo: "Estoque" },
  { tabela: "inventory_adjustments", rotulo: "Movimentações de estoque" },
  { tabela: "appointments", rotulo: "Compromissos" },
];

/**
 * Um valor do banco vira uma célula de CSV.
 *
 * Aspas duplicadas e o campo inteiro entre aspas quando há vírgula, aspas ou quebra de linha — a
 * regra do RFC 4180. Sem isso, uma observação com vírgula ("tomar em jejum, com água") desloca
 * todas as colunas seguintes daquela linha, e a planilha abre torta sem dizer por quê.
 */
function celulaCsv(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  if (!/[",\n\r]/.test(texto)) return texto;
  return `"${texto.replaceAll('"', '""')}"`;
}

/** As linhas de uma tabela viram um CSV com cabeçalho. Vazia, vira só um aviso legível. */
function tabelaParaCsv(linhas: Record<string, unknown>[]): string {
  if (linhas.length === 0) return "(sem registros)\n";

  /**
   * As colunas saem da **união** das chaves, e não da primeira linha.
   *
   * O SQLite devolve as colunas da tabela, então na prática todas as linhas têm as mesmas chaves —
   * mas se uma migração deixar uma coluna nova só nos registros recentes, ler apenas a primeira
   * linha silenciaria esse campo no arquivo inteiro.
   */
  const colunas = [...new Set(linhas.flatMap((linha) => Object.keys(linha)))];

  const cabecalho = colunas.map(celulaCsv).join(",");
  const corpo = linhas.map((linha) => colunas.map((c) => celulaCsv(linha[c])).join(","));

  // CRLF: é o que o Excel espera, e o LibreOffice aceita os dois.
  return [cabecalho, ...corpo].join("\r\n") + "\r\n";
}

/** "Horários de dose" → "horarios-de-dose.csv" — nome de arquivo sem acento nem espaço. */
function nomeDoArquivo(rotulo: string): string {
  const semAcento = rotulo.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return `${semAcento.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.csv`;
}

export type DadosExportados = {
  /** Caminho do arquivo gerado, pronto para ser compartilhado. */
  uri: string;
  /** Nome legível, com a data — é o que a pessoa vê ao salvar. */
  nome: string;
  /** Quantos registros o arquivo contém, somando todas as tabelas. */
  totalDeRegistros: number;
};

/** `2026-08-30T14:32:00.000Z` → `30/08/2026 14:32`. */
function dataLegivel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (v: number) => String(v).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Exporta **todos** os dados do titular num pacote `.zip` de planilhas CSV.
 *
 * É o direito de acesso e de portabilidade da LGPD (art. 18, II e V). As decisões:
 *
 * **CSV, e não JSON.** O JSON cumpria a lei — "formato de uso comum e leitura por máquina" — mas
 * cumpria só a metade que importa a um programador. Quem baixa a própria cópia quer *abrir* e
 * *olhar*, e um JSON de nove tabelas aninhadas não se lê no celular nem se importa em lugar nenhum
 * que o paciente use. CSV abre no Excel, no Google Planilhas e no LibreOffice, e continua sendo
 * dado estruturado para quem for processá-lo.
 *
 * **Um zip, e não nove arquivos soltos.** A tela de compartilhar do Android envia um arquivo por
 * vez; nove exportações separadas seriam nove idas ao menu. O zip é um anexo só, e o LEIA-ME dentro
 * dele explica o que é cada planilha.
 *
 * **Uma planilha por tabela**, e não uma só com tudo. As nove têm colunas diferentes — juntá-las
 * daria uma tabela com dezenas de colunas quase todas vazias em cada linha.
 *
 * **Tudo, inclusive o que foi apagado.** As linhas com `deleted_at` entram: elas ainda são dado do
 * titular guardado pelo app, e uma exportação que as escondesse não seria a cópia completa que a
 * lei pede. A coluna vai junto, então dá para distinguir o que está ativo do que foi removido.
 *
 * Os anexos (fotos, receita) **não** vão dentro do pacote — só o caminho deles. Embutir imagens
 * produziria um arquivo de dezenas de MB, e elas seguem acessíveis no aparelho.
 */
export async function exportarDados(): Promise<DadosExportados> {
  if (Platform.OS === "web") {
    throw new Error("A exportação está disponível apenas no aplicativo.");
  }

  const database = getDatabase();
  const geradoEm = new Date();

  /** Os arquivos do pacote, no formato que o `fflate` espera: nome → bytes. */
  const arquivos: Record<string, Uint8Array> = {};
  const codificador = new TextEncoder();
  let totalDeRegistros = 0;
  const resumo: string[] = [];

  for (const { tabela, rotulo } of TABELAS_EXPORTAVEIS) {
    // `SELECT *` sem filtro de `deleted_at`: a exportação é do que existe, não do que está visível.
    const linhas = await database
      .getAllAsync<Record<string, unknown>>(`SELECT * FROM ${tabela}`)
      // Tabela ausente (banco de uma versão anterior) não derruba a exportação inteira: o que dá
      // para entregar é entregue, e a lacuna é menos grave que a recusa.
      .catch(() => [] as Record<string, unknown>[]);

    /**
     * BOM antes do CSV.
     *
     * Sem ele o Excel no Windows lê o arquivo como ANSI e "Medicação" vira "MedicaÃ§Ã£o". É o
     * detalhe que faz a diferença entre uma planilha utilizável e uma que a pessoa desiste de abrir
     * — e o LibreOffice e o Google Sheets ignoram o BOM sem reclamar.
     */
    arquivos[nomeDoArquivo(rotulo)] = codificador.encode("﻿" + tabelaParaCsv(linhas));
    totalDeRegistros += linhas.length;
    resumo.push(`${rotulo} (${nomeDoArquivo(rotulo)}): ${linhas.length} registro(s)`);
  }

  /**
   * Um LEIA-ME dentro do pacote.
   *
   * Quem abre o zip encontra nove arquivos com nomes técnicos e nenhum contexto. Esta folha diz de
   * onde vieram, quando foram gerados e por que há linhas que a pessoa não vê mais no app — sem
   * ela, um registro com `deleted_at` preenchido parece dado que o app se recusou a apagar.
   */
  arquivos["LEIA-ME.txt"] = codificador.encode(
    [
      "Mapill: cópia dos seus dados",
      `Gerado em ${dataLegivel(geradoEm.toISOString())}`,
      "",
      "Cada arquivo .csv é uma planilha e abre no Excel, no LibreOffice ou no Google Planilhas.",
      "",
      "O que veio:",
      ...resumo.map((linha) => `  - ${linha}`),
      "",
      "Observações:",
      "  - Registros que você apagou no app também estão aqui, com a coluna deleted_at preenchida.",
      "    Eles continuam sendo dados seus enquanto o app os guarda, e uma cópia que os escondesse",
      "    não seria completa.",
      "  - As fotos e a receita anexada não estão neste pacote, apenas o caminho delas no aparelho.",
      "",
    ].join("\n"),
  );

  const p = (v: number) => String(v).padStart(2, "0");
  const nome = `mapill-meus-dados-${geradoEm.getFullYear()}-${p(geradoEm.getMonth() + 1)}-${p(geradoEm.getDate())}.zip`;

  // `zipSync` e não a versão assíncrona: são alguns milhares de linhas de texto no pior caso, e o
  // callback assíncrono do fflate obrigaria a envolver isto numa Promise sem ganho perceptível.
  const compactado = zipSync(arquivos, { level: 6 });

  const destino = new File(Paths.cache, nome);
  // Cache e não documentos: é um arquivo para sair do app, não para ficar. O sistema o limpa
  // sozinho depois, e deixá-lo no diretório de documentos criaria cópias de dado sensível se
  // acumulando a cada exportação.
  if (destino.exists) destino.delete();
  destino.create();
  destino.write(compactado);

  return { uri: destino.uri, nome, totalDeRegistros };
}
