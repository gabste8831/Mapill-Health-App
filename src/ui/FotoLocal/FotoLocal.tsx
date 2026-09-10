import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

import { useCores } from "@/shared/theme";

export type FotoLocalProps = {
  /** Caminho no diretório de documentos do app, vindo de `persistPickedFile`. */
  uri: string;
  style?: StyleProp<ImageStyle>;
  /** `cover` (padrão) para miniatura; `contain` quando a imagem é lida, caso da receita ampliada. */
  contentFit?: "cover" | "contain";
};

/**
 * Foto local escolhida pelo paciente.
 *
 * O `expo-image` indexa o cache pela URI, então arquivo novo reaproveitando URI antiga volta do
 * cache: `key` e `recyclingKey` amarram o componente à URI atual.
 *
 * Se a miniatura nascer invisível, o defeito não é daqui: no Android o `Pressable` que dispensa o
 * teclado (`KeyboardAwareScrollView`) não recompõe a linha da mídia quando ela estreia. A correção
 * é uma `key` na linha, na tela, e está documentada em `FichaDeSaudeScreen`.
 */
export function FotoLocal({ uri, style, contentFit = "cover" }: FotoLocalProps) {
  const cores = useCores();

  return (
    <Image
      // Os dois juntos: `key` remonta na troca de foto, `recyclingKey` cobre o reaproveitamento
      // de view dentro de lista.
      key={uri}
      source={{ uri }}
      style={[{ backgroundColor: cores.surfaceContainer }, style]}
      contentFit={contentFit}
      // `memory` e não `none`: `none` desliga o cache de memória, de onde sai o primeiro paint.
      // Não `memory-disk` porque o arquivo já está no disco do aparelho.
      cachePolicy="memory"
      recyclingKey={uri}
      transition={150}
    />
  );
}
