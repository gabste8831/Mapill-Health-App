import { File, Paths } from "expo-file-system";
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
 * Exporta **todos** os dados do titular num arquivo JSON legível.
 *
 * É o direito de acesso e de portabilidade da LGPD (art. 18, II e V). Duas decisões:
 *
 * **JSON, e não PDF.** Portabilidade quer dizer que o dado pode ir para outro lugar — um PDF é
 * bonito de ler e inútil de importar. O JSON é indentado e tem rótulos em português para quem
 * quiser só abrir e olhar, mas continua sendo dado estruturado para quem precisar processá-lo.
 *
 * **Tudo, inclusive o que foi apagado.** As linhas com `deleted_at` entram: elas ainda são dado do
 * titular guardado pelo app, e uma exportação que as escondesse não seria a cópia completa que a
 * lei pede. O campo vai junto, então dá para distinguir o que está ativo do que foi removido.
 *
 * Os anexos (fotos, receita) **não** vão dentro do arquivo — só o caminho deles. Embutir imagens em
 * base64 num JSON produziria um arquivo de dezenas de MB que nenhum leitor abre, e os arquivos
 * seguem acessíveis no aparelho.
 */
export async function exportarDados(): Promise<DadosExportados> {
  if (Platform.OS === "web") {
    throw new Error("A exportação está disponível apenas no aplicativo.");
  }

  const database = getDatabase();
  const geradoEm = new Date();

  const conteudo: Record<string, unknown> = {
    aplicativo: "Mapill",
    geradoEm: geradoEm.toISOString(),
    geradoEmLegivel: dataLegivel(geradoEm.toISOString()),
    aviso:
      "Esta é a cópia completa dos seus dados guardados pelo Mapill neste aparelho, incluindo " +
      "registros marcados como excluídos (campo deleted_at preenchido). As fotos e a receita " +
      "anexada não estão dentro deste arquivo — apenas o caminho delas no aparelho.",
  };

  let totalDeRegistros = 0;

  for (const { tabela, rotulo } of TABELAS_EXPORTAVEIS) {
    // `SELECT *` sem filtro de `deleted_at`: a exportação é do que existe, não do que está visível.
    const linhas = await database
      .getAllAsync<Record<string, unknown>>(`SELECT * FROM ${tabela}`)
      // Tabela ausente (banco de uma versão anterior) não derruba a exportação inteira: o que dá
      // para entregar é entregue, e a lacuna é menos grave que a recusa.
      .catch(() => [] as Record<string, unknown>[]);

    conteudo[rotulo] = linhas;
    totalDeRegistros += linhas.length;
  }

  const p = (v: number) => String(v).padStart(2, "0");
  const nome = `mapill-meus-dados-${geradoEm.getFullYear()}-${p(geradoEm.getMonth() + 1)}-${p(geradoEm.getDate())}.json`;

  const destino = new File(Paths.cache, nome);
  // Cache e não documentos: é um arquivo para sair do app, não para ficar. O sistema o limpa
  // sozinho depois, e deixá-lo no diretório de documentos criaria cópias de dado sensível se
  // acumulando a cada exportação.
  if (destino.exists) destino.delete();
  destino.create();
  destino.write(JSON.stringify(conteudo, null, 2));

  return { uri: destino.uri, nome, totalDeRegistros };
}
