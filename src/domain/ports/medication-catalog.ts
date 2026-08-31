import type { PrescriptionRequirement } from "../entities/medication";

/**
 * Um medicamento do catálogo da CMED — o que a base pública sabe, e não o que o paciente cadastrou.
 *
 * Deliberadamente pobre em relação a `Medication`: aqui não há foto, forma farmacêutica nem
 * posologia, porque a CMED não tem nada disso. O catálogo **sugere** o que dá para saber de fora;
 * o resto continua sendo resposta de quem tem a caixa na mão.
 */
export type CatalogEntry = {
  /** Nome comercial — "TYLENOL", "AAS". */
  name: string;
  /** Princípio ativo, como a CMED escreve. Pode trazer vários, separados por `;`. */
  activeIngredient: string;
  /** A dosagem extraída da apresentação — "500 MG", "10 MG/G". Vazia quando não se pôde extrair. */
  strength: string;
  /** Derivado da tarja. Continua editável no cadastro: a base pode estar desatualizada. */
  prescriptionRequirement: PrescriptionRequirement;
  /** Códigos de barras conhecidos deste produto e dosagem. */
  eans: string[];
};

export interface MedicationCatalog {
  /**
   * Busca por nome comercial ou princípio ativo.
   *
   * Sem acento e sem caixa: quem digita apressado no teclado do celular escreve "acido folico", e
   * o acento custa dois toques.
   */
  buscarPorNome(termo: string, limite: number): Promise<CatalogEntry[]>;
  /** Busca exata por código de barras — o caminho do B3. `null` quando o EAN não está na base. */
  buscarPorEan(ean: string): Promise<CatalogEntry | null>;
  /** Quantos registros o catálogo tem. Serve ao diagnóstico e ao estado vazio. */
  contar(): Promise<number>;
}
