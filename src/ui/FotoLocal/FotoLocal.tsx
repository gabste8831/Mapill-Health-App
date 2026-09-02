import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

import { colors } from "@/shared/theme";

export type FotoLocalProps = {
  /** Caminho no diretório de documentos do app, vindo de `persistPickedFile`. */
  uri: string;
  style?: StyleProp<ImageStyle>;
  /**
   * Como a imagem preenche o espaço. `cover` (padrão) para miniatura, onde o corte não custa nada
   * e o enquadramento cheio é o que faz a lista ficar alinhada.
   *
   * `contain` para quando a imagem é **lida** e não reconhecida — a receita ampliada, em que cortar
   * a borda pode cortar justamente a posologia escrita à mão no canto.
   */
  contentFit?: "cover" | "contain";
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
export function FotoLocal({ uri, style, contentFit = "cover" }: FotoLocalProps) {
  return (
    <Image
      /**
       * `key` na URI **remonta o componente** quando a foto muda, e é a segunda camada contra a
       * miniatura branca.
       *
       * `recyclingKey` (abaixo) limpa o conteúdo da view antes de carregar a próxima, mas ela
       * continua sendo a mesma view — e no Android isso deixa espaço para o carregador reaproveitar
       * o que já tinha em vez de reler o disco. `key` é a instrução que o React entende sem
       * ambiguidade: outra URI, outro componente. Custo zero aqui, porque trocar de foto não é
       * operação de rolagem.
       *
       * Os dois juntos, e não um ou outro: `key` cobre a troca de foto, `recyclingKey` cobre o
       * reaproveitamento de view dentro de lista.
       */
      key={uri}
      source={{ uri }}
      // O cinza vem antes do `style` de quem chama, que pode sobrescrevê-lo — é só o piso para o
      // quadrado nunca ficar transparente enquanto a imagem carrega.
      style={[{ backgroundColor: colors.surfaceContainer }, style]}
      contentFit={contentFit}
      cachePolicy="none"
      recyclingKey={uri}
      /**
       * O quadrado fica cinza enquanto a imagem não chega, em vez de vazio. Entre escolher a foto e
       * ela aparecer há a cópia do arquivo para o diretório do app, e nesse intervalo o quadrado em
       * branco lê como "não funcionou" — foi o que fez a miniatura parecer quebrada numa vez e
       * funcionar na outra, conforme a cópia terminasse antes ou depois do render.
       */
      placeholderContentFit={contentFit}
      transition={150}
    />
  );
}
