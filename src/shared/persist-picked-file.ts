import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

/**
 * Copia para o diretorio de documentos o arquivo que o picker devolveu em cache.
 *
 * O cache o sistema limpa quando quiser, e guardar aquela URI deixaria a ficha com uma foto que
 * some sozinha. No navegador nao ha diretorio de documentos, e a URI ja e exibivel enquanto a aba
 * viver.
 *
 * O nome e unico por escolha, e nao fixo por dono: com nome fixo a foto do segundo medicamento
 * sobrescrevia a do primeiro, e como a URI nao mudava o `expo-image` seguia servindo a antiga do
 * cache. O preco e ter que apagar o anterior, que e o que `replacing` faz.
 *
 * @param prefix identifica a origem no diretorio.
 * @param extension sem o ponto. PDF gravado como `.jpg` nao abre depois.
 * @param replacing URI de uma chamada anterior, a ser apagada. So arquivos do proprio diretorio de
 * documentos sao removidos: uma URI de cache ou de galeria nao e nossa para apagar.
 */
export function persistPickedFile(
  pickedUri: string,
  prefix: string,
  extension: string,
  replacing?: string | null,
): string {
  if (Platform.OS === "web") return pickedUri;

  const destination = new File(Paths.document, `${prefix}-${Date.now()}.${extension}`);
  // `copySync` e nao `copy`: esta funcao e sincrona, e sem `await` ela devolvia a URI de um arquivo
  // ainda sendo escrito, que o `expo-image` lia vazio.
  new File(pickedUri).copySync(destination);

  /**
   * Confere que o arquivo chegou inteiro antes de devolver a URI.
   *
   * O `copySync` deveria bastar, mas "a chamada retornou" e "o arquivo esta legivel" nao sao a
   * mesma coisa em todo aparelho. Ler `exists` e `size` forca o sistema de arquivos a responder, e
   * devolve erro em vez de uma URI que aponta para nada: quem chama sabe lidar com falha, e um
   * quadrado branco e indistinguivel de "o app nao funcionou".
   */
  const destinoOk = destination.exists && (destination.size ?? 0) > 0;
  if (!destinoOk) {
    throw new Error("O arquivo escolhido não pôde ser copiado por completo.");
  }

  if (replacing) deletePersistedFile(replacing);
  return destination.uri;
}

/**
 * Apaga um arquivo que `persistPickedFile` criou. Ignora o que não está no diretório de documentos
 * do app e o que já não existe - remover a foto duas vezes não é erro, é a mesma intenção repetida.
 */
export function deletePersistedFile(uri: string | null): void {
  if (Platform.OS === "web" || !uri) return;
  if (!uri.startsWith(Paths.document.uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Arquivo já removido ou inacessível: não há o que fazer, e falhar aqui derrubaria a tela.
  }
}
