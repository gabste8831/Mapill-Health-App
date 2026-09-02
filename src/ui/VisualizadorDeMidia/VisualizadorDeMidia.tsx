import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";

import { colors, estadoDePressao } from "@/shared/theme";
import { FotoLocal } from "@/ui/FotoLocal/FotoLocal";
import { styles } from "./VisualizadorDeMidia.styles";

export type VisualizadorDeMidiaProps = {
  /** A imagem a mostrar. `null` fecha o visualizador. */
  uri: string | null;
  /** O que está sendo visto — "Foto da caixa", "Receita médica". Lido pelo leitor de tela. */
  titulo: string;
  /** Uma linha de apoio sob a imagem, quando há algo a dizer (a validade da receita). */
  legenda?: string;
  onClose: () => void;
};

/**
 * A foto ampliada, sobre a tela que a chamou.
 *
 * ## Por que não ocupa a tela toda
 *
 * As miniaturas do app são pequenas — 56 a 72px — e servem para *reconhecer*, não para ler. A foto
 * da caixa responde "é este o remédio?"; a da receita responde "o que está escrito aqui?", e essa
 * segunda pergunta não se responde numa miniatura.
 *
 * Mas a resposta também não justifica trocar de tela. Quem toca na miniatura no meio de um cadastro
 * quer conferir e voltar ao campo seguinte — uma navegação de ida e volta perderia o lugar, e no
 * Android empilharia uma rota sobre o modal do cadastro. A camada por cima mantém o formulário
 * intacto atrás e sai com um toque fora.
 *
 * ## Só imagem
 *
 * PDF não se renderiza aqui: `expo-image` não o lê, e um leitor de PDF exigiria dependência nativa
 * (build nova). Quem chama trata o `document` abrindo o leitor do sistema — ver `abrirDocumento` em
 * `abrir-anexo.ts`. É melhor caminho de qualquer forma: o leitor do aparelho tem zoom, busca e
 * rolagem de páginas, que este visualizador nunca teria.
 */
export function VisualizadorDeMidia({ uri, titulo, legenda, onClose }: VisualizadorDeMidiaProps) {
  return (
    <Modal
      visible={uri !== null}
      transparent
      animationType="fade"
      // O botão físico de voltar fecha a camada, e não a tela que está atrás dela.
      onRequestClose={onClose}
      statusBarTranslucent>
      {/**
       * O fundo inteiro é o alvo de fechar. É o gesto que as galerias ensinaram, e ele existe aqui
       * junto do X — não no lugar dele: gesto sem affordance visível é atalho para quem já sabe, e
       * o público deste app inclui quem não sabe.
       */}
      <Pressable style={styles.fundo} onPress={onClose} accessibilityLabel="Fechar a imagem">
        <View style={styles.topo}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
          <Pressable
            style={estadoDePressao(styles.fechar, { escala: true })}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar">
            <Ionicons name="close" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>

        {/**
         * O toque na imagem **não** fecha: `onPress` vazio impede que ele chegue ao fundo.
         *
         * Sem isso, tocar na própria foto para olhar de perto a fecharia — o gesto mais natural
         * seria o que tira da tela o que se queria ver.
         */}
        {uri !== null ? (
          <Pressable style={styles.quadro} onPress={() => {}} accessibilityRole="image">
            {/* `contain` e não `cover`: aqui a imagem é lida, e cortar a borda de uma receita pode
                cortar a posologia escrita à mão no canto. */}
            <FotoLocal uri={uri} style={styles.imagem} contentFit="contain" />
          </Pressable>
        ) : null}

        {legenda !== undefined ? <Text style={styles.legenda}>{legenda}</Text> : null}
      </Pressable>
    </Modal>
  );
}
