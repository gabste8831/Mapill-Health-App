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
 * Zera os caminhos de foto e anexo cujo **arquivo não está mais no aparelho**.
 *
 * ## Por que existe
 *
 * Os anexos não sobem para a nuvem (decisão E9). O **caminho** deles subia, e num aparelho
 * reinstalado o app recebia `file:///data/user/0/…/foto.jpg` — uma string que aponta para nada.
 * A tela então oferecia "Trocar foto da caixa" e "Remover" para uma imagem que não existe, e o
 * quadrado ficava vazio sem dizer por quê.
 *
 * A origem já foi corrigida: esses campos sobem como `null`, e o `receber` confere a existência do
 * arquivo antes de gravar. Mas quem sincronizou **antes** dessas correções tem o caminho gravado, e
 * o pull só revisita linhas cujo `updated_at` mudou — nelas o defeito ficaria para sempre.
 *
 * ## Por que aqui, e não numa migration
 *
 * Migration é SQL puro e não consegue perguntar ao sistema de arquivos se o caminho existe. A opção
 * lá seria apagar **todos** os caminhos, o que custaria a foto de quem nunca trocou de aparelho e
 * tem o arquivo intacto. Aqui a verificação é possível, e só o que de fato sumiu é limpado.
 *
 * ## Por que não incomoda
 *
 * Roda na abertura, depois das migrations, e o caso comum é não encontrar nada — três consultas que
 * não retornam linha nenhuma. Só faz trabalho quando há o que consertar.
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
        // Caminho malformado — de outra instalação, ou de um formato que o app não usa mais.
        existe = false;
      }

      if (!existe) {
        /**
         * `updated_at` **não** é tocado, de propósito.
         *
         * Mexer nele marcaria a linha como alterada e a mandaria de volta ao servidor — subindo uma
         * "edição" que a pessoa não fez, e que num segundo aparelho apagaria a foto que lá existe.
         * A limpeza é local porque o problema é local: o arquivo sumiu **neste** aparelho.
         */
        await database.runAsync(`UPDATE ${tabela} SET ${coluna} = NULL WHERE id = ?`, [id]);
      }
    }
  }
}
