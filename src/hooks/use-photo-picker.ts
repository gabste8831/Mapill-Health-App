import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

import { persistPickedFile } from "@/shared/persist-picked-file";

/** Motivo pelo qual a escolha não resultou numa foto. A tela decide o que dizer em cada caso. */
export type PhotoPickFailure = "permission-denied" | "cancelled" | "failed";

export type PhotoPick =
  | { status: "picked"; uri: string }
  | { status: "failed"; reason: PhotoPickFailure };

/**
 * @param prefix identifica a origem da foto no diretório de documentos ("ficha-foto",
 * "medicamento-caixa"). O nome final leva um sufixo único — ver `persistPickedFile`.
 */
export function usePhotoPicker(prefix: string) {
  const [isPicking, setPicking] = useState(false);

  /** @param replacing foto atual, apagada quando a nova entra no lugar. */
  const pickPhoto = useCallback(
    async (replacing?: string | null): Promise<PhotoPick> => {
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
