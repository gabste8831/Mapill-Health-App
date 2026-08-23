import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";

import { persistPickedFile } from "@/shared/persist-picked-file";

/** O que o seletor de arquivos aceita. Receita vem escaneada (PDF) ou fotografada. */
export const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

/** Como o rótulo diz isso na tela, pra pessoa não descobrir o formato aceito no erro. */
export const ACCEPTED_DOCUMENT_LABEL = "PDF, JPG ou PNG";

export type DocumentPick =
  | { status: "picked"; uri: string; name: string; isPdf: boolean }
  | { status: "failed"; reason: "cancelled" | "failed" };

/**
 * Seleção de um arquivo já salvo no aparelho — o caminho de quem recebeu a receita digital ou
 * escaneou na clínica. Diferente do seletor de fotos: não pede permissão de galeria, porque o
 * sistema entrega só o arquivo escolhido e nada mais.
 *
 * @param prefix nome base no diretório de documentos; a extensão real do arquivo é anexada,
 * senão um PDF gravado como `.jpg` não abriria depois.
 */
export function useDocumentPicker(prefix: string) {
  const [isPicking, setPicking] = useState(false);

  /** @param replacing anexo atual, apagado quando o novo entra no lugar. */
  const pickDocument = useCallback(
    async (replacing?: string | null): Promise<DocumentPick> => {
      setPicking(true);
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ACCEPTED_DOCUMENT_TYPES,
          // Sem isto o arquivo pode vir de um provedor de nuvem sem cópia local, e a URI não
          // sobrevive à tela — é o próprio aviso da documentação do SDK.
          copyToCacheDirectory: true,
          multiple: false,
        });
        const asset = result.canceled ? undefined : result.assets[0];
        if (asset === undefined) return { status: "failed", reason: "cancelled" };

        const isPdf =
          asset.mimeType === "application/pdf" || asset.name.toLowerCase().endsWith(".pdf");
        const extensao = isPdf ? "pdf" : (asset.name.split(".").pop() ?? "jpg");
        return {
          status: "picked",
          uri: persistPickedFile(asset.uri, prefix, extensao, replacing),
          name: asset.name,
          isPdf,
        };
      } catch {
        return { status: "failed", reason: "failed" };
      } finally {
        setPicking(false);
      }
    },
    [prefix],
  );

  return { isPicking, pickDocument };
}
