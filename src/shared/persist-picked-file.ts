import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

/**
 * O picker devolve um arquivo em cache, que o sistema pode limpar a qualquer momento — guardar
 * essa URI deixaria a ficha com uma foto (ou uma receita) que some sozinha. Por isso o arquivo é
 * copiado pro diretório de documentos do app, que persiste entre aberturas.
 *
 * No navegador não existe diretório de documentos, e a URI que o picker devolve já é exibível e
 * vive enquanto a aba viver — copiar ali falharia e derrubaria a escolha inteira.
 *
 * O nome é único por escolha, e não fixo por dono. Nome fixo quebrava de duas formas: a foto do
 * segundo medicamento sobrescrevia a do primeiro (todo cadastro gravava em `medicamento-caixa.jpg`),
 * e como a URI não mudava, o `expo-image` continuava servindo a imagem antiga do cache — a foto
 * recém-escolhida simplesmente não aparecia. O preço do nome único é ter que apagar o anterior,
 * que é o que `replacing` faz.
 *
 * @param prefix identifica a origem no diretório ("ficha-foto", "medicamento-caixa").
 * @param extension sem o ponto. PDF gravado como `.jpg` não abre depois.
 * @param replacing URI devolvida por uma chamada anterior, a ser apagada. Só arquivos do próprio
 * diretório de documentos são removidos — uma URI de cache ou de galeria não é nossa pra apagar.
 */
export function persistPickedFile(
  pickedUri: string,
  prefix: string,
  extension: string,
  replacing?: string | null,
): string {
  if (Platform.OS === "web") return pickedUri;

  const destination = new File(Paths.document, `${prefix}-${Date.now()}.${extension}`);
  /**
   * `copySync`, e não `copy`.
   *
   * `copy()` devolve uma `Promise`, e esta função é síncrona: sem `await`, ela retornava a URI de
   * um arquivo que ainda estava sendo escrito. Quem recebia a URI mandava exibir na hora e o
   * `expo-image` lia um arquivo vazio — a miniatura aparecia **branca**. Salvando e voltando à
   * tela, a cópia já tinha terminado e a mesma URI mostrava a foto, o que fazia o defeito parecer
   * de cache quando era de corrida.
   *
   * A versão síncrona é a correta aqui: a chamada já acontece depois do picker, fora de qualquer
   * caminho crítico de rolagem, e o arquivo é de dezenas de KB — o custo é imperceptível, e em
   * troca quem recebe a URI recebe um arquivo pronto para ler.
   */
  new File(pickedUri).copySync(destination);
  if (replacing) deletePersistedFile(replacing);
  return destination.uri;
}

/**
 * Apaga um arquivo que `persistPickedFile` criou. Ignora o que não está no diretório de documentos
 * do app e o que já não existe — remover a foto duas vezes não é erro, é a mesma intenção repetida.
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
