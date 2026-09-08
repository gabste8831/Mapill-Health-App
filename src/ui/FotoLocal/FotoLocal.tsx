import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

import { useCores } from "@/shared/theme";

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
 * `key` e `recyclingKey` amarram o componente à URI atual: trocar a foto descarta a view anterior
 * em vez de reaproveitá-la.
 *
 * ## A miniatura branca não era daqui (08/09)
 *
 * Seis correções foram feitas neste arquivo por causa de um defeito que nunca esteve nele: a foto
 * escolhida ficava invisível até a tela remontar. A instrumentação em aparelho mostrou este
 * componente fazendo tudo certo — URI recebida, arquivo lido com bytes válidos, ciclo completo de
 * `onLoadStart` a `onDisplay`, sem erro, com JPEG e PNG, de câmera e de galeria — e `onLayout`
 * reportando 72×72. Trocar a imagem por um bloco de cor sólida foi o que encerrou a questão:
 * **nem o bloco aparecia**.
 *
 * A causa estava na árvore acima. Todo formulário vive dentro do `Pressable` que dispensa o
 * teclado (ver `KeyboardAwareScrollView`), e no Android essa árvore não recompunha a linha da
 * mídia quando ela estreava — a caixa nativa continuava a que fora medida vazia. A correção é uma
 * `key` na linha, em cada tela que exibe mídia, e está documentada em `FichaDeSaudeScreen`.
 *
 * Fica o registro para a próxima pessoa: quando o log diz que a imagem carregou, tem tamanho e
 * exibiu, o problema não é da imagem. Vale trocar por um retângulo colorido antes de mexer aqui —
 * dois minutos de sonda contra seis correções por hipótese.
 */
export function FotoLocal({ uri, style, contentFit = "cover" }: FotoLocalProps) {
  const cores = useCores();

  return (
    <Image
      /**
       * `key` na URI **remonta o componente** quando a foto muda, e é a segunda camada contra a
       * imagem errada.
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
      style={[{ backgroundColor: cores.surfaceContainer }, style]}
      contentFit={contentFit}
      /**
       * `memory`, e **não** `none`.
       *
       * `none` era a terceira proteção contra a mesma coisa que `key` e `recyclingKey` já cobrem —
       * servir a imagem antiga quando a URI muda. Só que ele desliga também o cache de **memória**,
       * e é dali que sai o primeiro paint.
       *
       * Servir a imagem errada continua impossível: `persistPickedFile` gera nome único por escolha,
       * então duas fotos nunca compartilham URI, e `key={uri}` remonta o componente quando ela muda.
       * O cache de memória só pode devolver o que foi pedido com aquela URI exata.
       *
       * `memory` e não `memory-disk`: o arquivo **já está** no disco do aparelho, e uma segunda
       * cópia em disco não compra nada.
       */
      cachePolicy="memory"
      recyclingKey={uri}
      transition={150}
    />
  );
}
