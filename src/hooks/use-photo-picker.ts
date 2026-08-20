import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

/** Motivo pelo qual a escolha não resultou numa foto. A tela decide o que dizer em cada caso. */
export type PhotoPickFailure = "permission-denied" | "cancelled" | "failed";

export type PhotoPick =
  | { status: "picked"; uri: string }
  | { status: "failed"; reason: PhotoPickFailure };

/**
 * O picker devolve um arquivo em cache, que o sistema pode limpar a qualquer momento — guardar
 * essa URI deixaria a ficha com uma foto que some sozinha. Por isso o arquivo é copiado pro
 * diretório de documentos do app, que persiste entre aberturas.
 * */
function persistPickedPhoto(pickedUri: string, fileName: string): string {
  const destination = new File(Paths.document, fileName);
  if (destination.exists) destination.delete();
  new File(pickedUri).copy(destination);
  return destination.uri;
}

/**
 * @param fileName nome fixo do arquivo no diretório de documentos. Fixo de propósito: cada dono
 * (a ficha, um medicamento) tem uma foto só, e sobrescrever evita acumular imagens órfãs.
 */
export function usePhotoPicker(fileName: string) {
  const [isPicking, setPicking] = useState(false);

  const pickPhoto = useCallback(async (): Promise<PhotoPick> => {
    setPicking(true);
    try {
      // Só galeria: o app ainda não tira foto, e pedir permissão de câmera sem usar contraria
      // o princípio de minimização (ver cameraPermission: false no app.json).
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return { status: "failed", reason: "permission-denied" };

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return { status: "failed", reason: "cancelled" };

      return { status: "picked", uri: persistPickedPhoto(result.assets[0].uri, fileName) };
    } catch {
      return { status: "failed", reason: "failed" };
    } finally {
      setPicking(false);
    }
  }, [fileName]);

  return { isPicking, pickPhoto };
}
