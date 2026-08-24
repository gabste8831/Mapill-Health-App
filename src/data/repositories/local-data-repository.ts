import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

import { getDatabase } from "../local/database";

/**
 * Tabelas com dado clínico, na ordem em que precisam morrer: filhas antes das mães. As chaves
 * estrangeiras não são impostas pelo SQLite aqui, mas apagar de baixo para cima mantém o banco
 * consistente em qualquer instante intermediário — inclusive se o processo for morto no meio.
 */
const TABELAS_CLINICAS = [
  "intake_logs",
  "dose_schedules",
  "inventory_adjustments",
  "inventory_items",
  "prescriptions",
  "medications",
  "appointments",
];

/** Quem o paciente é e o que ele consentiu. Só some no apagamento total. */
const TABELAS_DE_IDENTIDADE = ["patient_profiles", "consent_records"];

/**
 * Prefixos que `persistPickedFile` usa ao gravar no diretório de documentos. Apagar por prefixo,
 * e não o diretório inteiro, é o que impede levar junto arquivo de outra origem (banco do
 * `expo-sqlite`, cache de biblioteca) que também mora ali.
 */
const PREFIXOS_DE_ARQUIVO = ["ficha-foto", "medicamento-caixa", "medicamento-receita"];

/**
 * Apagamento real dos dados locais — o direito de exclusão da LGPD (art. 18) do lado que existe
 * hoje, e também o botão que torna o app testável sem desinstalar.
 *
 * É **hard delete**, não `deleted_at`. Exclusão lógica é a ferramenta certa para o item que o
 * paciente removeu da lista, porque o histórico de ingestão ainda aponta para ele e a
 * sincronização precisa da linha marcada para contar ao servidor que ela morreu. Aqui a intenção
 * é oposta: o dado sensível não pode continuar no aparelho. Manter a linha "escondida" seria
 * exatamente o que a lei chama de tratamento, e o que o plano proíbe em "purge local real, não só
 * ocultar da UI".
 *
 * ⚠️ **Quando o D1 existir, isto deixa de bastar.** Com sincronização ligada, apagar só o local
 * faria o próximo `pull` trazer tudo de volta do servidor — o apagamento tem que acontecer nos
 * dois lados, e o de lá primeiro. Ver o D3.
 */
export class LocalDataRepository {
  /** Medicamentos, tratamentos, horários, histórico, estoque e compromissos. Ficha e consentimento ficam. */
  async eraseHealthData(): Promise<void> {
    await this.eraseTables(TABELAS_CLINICAS);
    this.eraseFiles(["medicamento-caixa", "medicamento-receita"]);
  }

  /** Tudo: o clínico, a ficha, o consentimento e os arquivos. O app volta à primeira execução. */
  async eraseEverything(): Promise<void> {
    await this.eraseTables([...TABELAS_CLINICAS, ...TABELAS_DE_IDENTIDADE]);
    this.eraseFiles(PREFIXOS_DE_ARQUIVO);
  }

  /**
   * Numa transação só: apagar metade deixaria o app num estado que nenhuma tela sabe desenhar —
   * tratamento sem medicamento, dose sem tratamento.
   */
  private async eraseTables(tabelas: string[]): Promise<void> {
    const database = getDatabase();
    await database.withTransactionAsync(async () => {
      for (const tabela of tabelas) {
        await database.runAsync(`DELETE FROM ${tabela}`);
      }
    });
  }

  /**
   * As fotos e as receitas anexadas. Ficam fora da transação de propósito: sistema de arquivos não
   * participa dela, e falhar em apagar um arquivo não pode desfazer o apagamento do banco — o
   * arquivo órfão é recuperável, o banco meio apagado não.
   */
  private eraseFiles(prefixos: string[]): void {
    if (Platform.OS === "web") return;
    try {
      for (const entrada of new Directory(Paths.document).list()) {
        if (entrada instanceof File && prefixos.some((prefixo) => entrada.name.startsWith(prefixo))) {
          entrada.delete();
        }
      }
    } catch {
      // Diretório inacessível: o banco já foi apagado, que é o que carrega o dado clínico.
      // Derrubar a tela aqui faria a pessoa achar que nada aconteceu, e tentar de novo.
    }
  }
}
