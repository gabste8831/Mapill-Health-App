import { File } from "expo-file-system";
import { Platform } from "react-native";

import { getDatabase } from "./database";

/** Onde cada tabela guarda caminho de arquivo do aparelho. */
const CAMPOS_DE_ARQUIVO = [
  { tabela: "patient_profiles", coluna: "photo_uri" },
  { tabela: "medications", coluna: "photo_uri" },
  { tabela: "prescriptions", coluna: "attachment_uri" },
] as const;

/**
 * Zera os caminhos de foto e anexo cujo arquivo nao esta mais no aparelho.
 *
 * Os anexos nao sobem para a nuvem, mas o caminho deles subia: num aparelho reinstalado o app
 * recebia uma string apontando para nada, e a tela oferecia "Trocar" e "Remover" para uma imagem
 * inexistente. A origem ja foi corrigida, mas quem sincronizou antes tem o caminho gravado, e o
 * pull so revisita linhas cujo `updated_at` mudou.
 *
 * Aqui, e nao numa migration, porque SQL nao pergunta ao sistema de arquivos se o caminho existe:
 * la a opcao seria apagar todos, custando a foto de quem tem o arquivo intacto.
 *
 * Roda na abertura, e o caso comum e nao encontrar nada.
 */
export async function limparAnexosPerdidos(): Promise<void> {
  if (Platform.OS === "web") return;

  const database = getDatabase();

  for (const { tabela, coluna } of CAMPOS_DE_ARQUIVO) {
    const linhas = await database
      .getAllAsync<{ id: string; caminho: string }>(
        `SELECT id, ${coluna} AS caminho FROM ${tabela} WHERE ${coluna} IS NOT NULL`,
      )
      // Tabela ausente num banco de versão antiga não pode derrubar a abertura do app.
      .catch(() => [] as { id: string; caminho: string }[]);

    for (const { id, caminho } of linhas) {
      let existe = false;
      try {
        existe = new File(caminho).exists;
      } catch {
        // Caminho malformado - de outra instalação, ou de um formato que o app não usa mais.
        existe = false;
      }

      if (!existe) {
        /**
         * `updated_at` **não** é tocado, de propósito.
         *
         * Mexer nele marcaria a linha como alterada e a mandaria de volta ao servidor - subindo uma
         * "edição" que a pessoa não fez, e que num segundo aparelho apagaria a foto que lá existe.
         * A limpeza é local porque o problema é local: o arquivo sumiu **neste** aparelho.
         */
        await database.runAsync(`UPDATE ${tabela} SET ${coluna} = NULL WHERE id = ?`, [id]);
      }
    }
  }
}
