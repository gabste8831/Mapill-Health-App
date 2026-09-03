import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { PhotoOrigin } from "@/hooks/use-photo-picker";
import { useCores, useEstilos } from "@/shared/theme";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { criarEstilos } from "./EscolhaDeOrigemDaFoto.styles";

export type EscolhaDeOrigemDaFotoProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onEscolher: (origin: PhotoOrigin) => void;
  /**
   * Terceira origem: um arquivo já salvo no aparelho (PDF, principalmente). Só existe onde faz
   * sentido — a receita chega por e-mail em PDF, a caixa do remédio não.
   */
  onEscolherArquivo?: () => void;
};

/**
 * De onde vem o anexo: câmera, galeria ou — onde couber — um arquivo do aparelho.
 *
 * Popup em vez de botões soltos na tela porque a pergunta só existe **depois** de a pessoa decidir
 * que quer anexar algo: sempre visível, ela faria o cadastro carregar três ações para um campo
 * opcional. A ordem não é alfabética. A câmera vem primeiro porque é a origem provável (ninguém tem
 * foto da caixa do remédio guardada na galeria), a galeria vem depois, e o arquivo por último, que
 * é o caso mais específico dos três.
 */
export function EscolhaDeOrigemDaFoto({
  visible,
  title,
  onClose,
  onEscolher,
  onEscolherArquivo,
}: EscolhaDeOrigemDaFotoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.body}>
        <Pressable
          style={styles.opcao}
          onPress={() => onEscolher("camera")}
          accessibilityRole="button">
          <Ionicons name="camera" size={24} color={cores.primary} />
          <View style={styles.texto}>
            <Text style={styles.rotulo}>Tirar foto agora</Text>
            <Text style={styles.dica}>Abre a câmera do aparelho.</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.opcao}
          onPress={() => onEscolher("galeria")}
          accessibilityRole="button">
          <Ionicons name="images" size={24} color={cores.primary} />
          <View style={styles.texto}>
            <Text style={styles.rotulo}>Escolher da galeria</Text>
            <Text style={styles.dica}>Para uma foto que você já tem.</Text>
          </View>
        </Pressable>

        {/* Só onde o arquivo faz sentido: a receita chega em PDF por e-mail, a caixa do remédio
            nunca. Oferecer nas duas seria dar uma saída que numa delas não leva a lugar nenhum. */}
        {onEscolherArquivo ? (
          <Pressable
            style={styles.opcao}
            onPress={onEscolherArquivo}
            accessibilityRole="button">
            <Ionicons name="document-text" size={24} color={cores.primary} />
            <View style={styles.texto}>
              <Text style={styles.rotulo}>Escolher arquivo</Text>
              <Text style={styles.dica}>PDF ou imagem salvos no aparelho.</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}
