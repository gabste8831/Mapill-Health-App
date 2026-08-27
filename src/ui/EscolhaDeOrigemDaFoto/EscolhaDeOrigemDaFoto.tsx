import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { PhotoOrigin } from "@/hooks/use-photo-picker";
import { colors } from "@/shared/theme";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { styles } from "./EscolhaDeOrigemDaFoto.styles";

export type EscolhaDeOrigemDaFotoProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onEscolher: (origin: PhotoOrigin) => void;
};

/**
 * De onde vem a foto: câmera ou galeria.
 *
 * Popup em vez de dois botões soltos na tela porque a pergunta só existe **depois** de a pessoa
 * decidir que quer uma foto — colocá-la sempre visível faria o cadastro carregar duas ações para
 * um campo opcional. E a ordem não é alfabética: a câmera vem primeiro porque é a origem provável
 * (ninguém tem foto da caixa do remédio guardada na galeria), e a galeria continua ali para a
 * receita que chegou por mensagem.
 */
export function EscolhaDeOrigemDaFoto({
  visible,
  title,
  onClose,
  onEscolher,
}: EscolhaDeOrigemDaFotoProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.body}>
        <Pressable
          style={styles.opcao}
          onPress={() => onEscolher("camera")}
          accessibilityRole="button">
          <Ionicons name="camera" size={24} color={colors.primary} />
          <View style={styles.texto}>
            <Text style={styles.rotulo}>Tirar foto agora</Text>
            <Text style={styles.dica}>Abre a câmera do aparelho.</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.opcao}
          onPress={() => onEscolher("galeria")}
          accessibilityRole="button">
          <Ionicons name="images" size={24} color={colors.primary} />
          <View style={styles.texto}>
            <Text style={styles.rotulo}>Escolher da galeria</Text>
            <Text style={styles.dica}>Para uma foto que você já tem.</Text>
          </View>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
