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
 * @param fileName nome fixo no diretório de documentos. Fixo de propósito: cada dono (a ficha, um
 * medicamento) tem um arquivo só, e sobrescrever evita acumular órfãos.
 */
export function persistPickedFile(pickedUri: string, fileName: string): string {
  if (Platform.OS === "web") return pickedUri;

  const destination = new File(Paths.document, fileName);
  if (destination.exists) destination.delete();
  new File(pickedUri).copy(destination);
  return destination.uri;
}
