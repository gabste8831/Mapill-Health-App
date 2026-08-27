import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

export type FotoLocalProps = {
  /** Caminho no diretório de documentos do app, vindo de `persistPickedFile`. */
  uri: string;
  style?: StyleProp<ImageStyle>;
};

/**
 * Foto escolhida pelo paciente — da ficha, da caixa do remédio ou da receita.
 *
 * Existe por causa do cache do `expo-image`, que guarda em memória e em disco indexado pela URI.
 * Arquivo local recém-escrito com a mesma URI de um anterior volta do cache em vez de ser lido do
 * disco, e a foto que acabou de ser escolhida não aparece. `persistPickedFile` já gera nome único
 * justamente para evitar isso, mas depender só disso deixa a proteção espalhada: basta uma tela
 * futura reutilizar um caminho para o bug voltar, e ele volta silencioso — a tela mostra *uma*
 * imagem, só que a errada.
 *
 * `recyclingKey` amarra o componente à URI atual, então trocar a foto descarta a view anterior em
 * vez de reaproveitá-la. Arquivo local não ganha nada com cache: ele já está no disco do aparelho,
 * e reler custa menos que exibir a imagem errada num app onde a foto serve para **reconhecer o
 * remédio certo**.
 */
export function FotoLocal({ uri, style }: FotoLocalProps) {
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="none"
      recyclingKey={uri}
    />
  );
}
