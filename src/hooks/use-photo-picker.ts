import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

import { persistPickedFile } from "@/shared/persist-picked-file";

/** Motivo pelo qual a escolha não resultou numa foto. A tela decide o que dizer em cada caso. */
export type PhotoPickFailure = "permission-denied" | "cancelled" | "failed";

export type PhotoPick =
  | { status: "picked"; uri: string }
  | { status: "failed"; reason: PhotoPickFailure };

/** De onde a imagem vem. São dois pedidos de permissão diferentes, e dois fluxos diferentes. */
export type PhotoOrigin = "galeria" | "camera";

/**
 * @param prefix identifica a origem da foto no diretório de documentos ("ficha-foto",
 * "medicamento-caixa"). O nome final leva um sufixo único — ver `persistPickedFile`.
 */
export function usePhotoPicker(prefix: string) {
  const [isPicking, setPicking] = useState(false);

  /**
   * @param origin de onde tirar a imagem. A câmera entrou em 27/08 (E10 da revisão): é improvável
   * que alguém já tenha a foto da caixa do remédio na galeria, e mandar sair do app para
   * fotografar e voltar era o caminho longo para a origem mais provável.
   *
   * A permissão é pedida **só quando a origem escolhida precisa dela** — abrir a galeria não
   * dispara pedido de câmera. É o que sobra do princípio de minimização depois de a câmera passar
   * a ser usada de verdade: pedir o que se usa, quando se usa.
   *
   * @param replacing foto atual, apagada quando a nova entra no lugar.
   */
  const pickPhoto = useCallback(
    async (origin: PhotoOrigin = "galeria", replacing?: string | null): Promise<PhotoPick> => {
      setPicking(true);
      try {
        const permission =
          origin === "camera"
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return { status: "failed", reason: "permission-denied" };

        const options: ImagePicker.ImagePickerOptions = {
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        };
        const result =
          origin === "camera"
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);
        if (result.canceled || !result.assets[0]) return { status: "failed", reason: "cancelled" };

        return {
          status: "picked",
          uri: persistPickedFile(result.assets[0].uri, prefix, "jpg", replacing),
        };
      } catch {
        return { status: "failed", reason: "failed" };
      } finally {
        setPicking(false);
      }
    },
    [prefix],
  );

  return { isPicking, pickPhoto };
}
