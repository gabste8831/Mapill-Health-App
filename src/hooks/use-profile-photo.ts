import { File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

/** Motivo pelo qual a escolha não resultou numa foto. A tela decide o que dizer em cada caso. */
export type ProfilePhotoFailure = "permission-denied" | "cancelled" | "failed";

export type ProfilePhotoPick =
  | { status: "picked"; uri: string }
  | { status: "failed"; reason: ProfilePhotoFailure };

const PHOTO_FILE_NAME = "ficha-foto.jpg";

/**
 * O picker devolve um arquivo em cache, que o sistema pode limpar a qualquer momento — guardar
 * essa URI deixaria a ficha com uma foto que some sozinha. Por isso o arquivo é copiado pro
 * diretório de documentos do app, que persiste entre aberturas.
 *
 * Nome fixo: a ficha tem uma foto só, e sobrescrever evita acumular imagens órfãs a cada troca.
 */
function persistPickedPhoto(pickedUri: string): string {
  const destination = new File(Paths.document, PHOTO_FILE_NAME);
  if (destination.exists) destination.delete();
  new File(pickedUri).copy(destination);
  return destination.uri;
}

export function useProfilePhotoPicker() {
  const [isPicking, setPicking] = useState(false);

  const pickPhoto = useCallback(async (): Promise<ProfilePhotoPick> => {
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

      return { status: "picked", uri: persistPickedPhoto(result.assets[0].uri) };
    } catch {
      return { status: "failed", reason: "failed" };
    } finally {
      setPicking(false);
    }
  }, []);

  return { isPicking, pickPhoto };
}
