import type { PrescriptionRequirement } from "../../domain/entities/medication";
import type {
  CatalogEntry,
  MedicationCatalog,
} from "../../domain/ports/medication-catalog";
import { getDatabase } from "../local/database";

type CmedRow = {
  id: number;
  name: string;
  active_ingredient: string;
  strength: string;
  prescription_requirement: string;
};

/**
 * Sem acento, maiúsculas — a mesma normalização usada ao gravar a coluna `search`.
 *
 * Precisa ser idêntica à do script que gera `cmed.json`, senão a busca não acha o que está lá. É a
 * duplicação inevitável entre o preparo (Node) e a consulta (app); o teste em Node cobre o formato.
 */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function toEntry(row: CmedRow, eans: string[]): CatalogEntry {
  return {
    name: row.name,
    activeIngredient: row.active_ingredient,
    strength: row.strength,
    prescriptionRequirement: row.prescription_requirement as PrescriptionRequirement,
    eans,
  };
}

/**
 * O catálogo da CMED em SQLite.
 *
 * A busca é `LIKE` sobre uma coluna já normalizada, e não um `FTS`: com 7 mil linhas curtas o
 * ganho do índice de texto completo não paga a complexidade de manter uma tabela virtual em
 * sincronia — e `LIKE 'TERMO%'` usa o índice comum quando ancorado no começo.
 *
 * A ordenação favorece **quem começa com o termo**: quem digita "aas" quer o AAS, e não os doze
 * remédios cujo princípio ativo contém "aas" no meio.
 */
export class CmedCatalogRepository implements MedicationCatalog {
  private readonly database = getDatabase();

  async buscarPorNome(termo: string, limite: number): Promise<CatalogEntry[]> {
    const alvo = normalizarBusca(termo);
    // Menos de dois caracteres devolveria meia base e nenhuma informação.
    if (alvo.length < 2) return [];

    const rows = await this.database.getAllAsync<CmedRow>(
      `SELECT id, name, active_ingredient, strength, prescription_requirement
       FROM cmed_entries
       WHERE search LIKE ?
       ORDER BY
         CASE WHEN name LIKE ? THEN 0 ELSE 1 END,
         LENGTH(name),
         name
       LIMIT ?`,
      [`%${alvo}%`, `${alvo}%`, limite],
    );

    return Promise.all(
      rows.map(async (row) => toEntry(row, await this.eansDaEntrada(row.id))),
    );
  }

  async buscarPorEan(ean: string): Promise<CatalogEntry | null> {
    const limpo = ean.replace(/\D/g, "");
    if (limpo.length === 0) return null;

    const row = await this.database.getFirstAsync<CmedRow>(
      `SELECT e.id, e.name, e.active_ingredient, e.strength, e.prescription_requirement
       FROM cmed_eans AS b
       JOIN cmed_entries AS e ON e.id = b.entry_id
       WHERE b.ean = ?`,
      [limpo],
    );
    if (row === null) return null;
    return toEntry(row, await this.eansDaEntrada(row.id));
  }

  async contar(): Promise<number> {
    const row = await this.database.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM cmed_entries",
    );
    return row?.total ?? 0;
  }

  private async eansDaEntrada(entryId: number): Promise<string[]> {
    const rows = await this.database.getAllAsync<{ ean: string }>(
      "SELECT ean FROM cmed_eans WHERE entry_id = ?",
      [entryId],
    );
    return rows.map((row) => row.ean);
  }
}
