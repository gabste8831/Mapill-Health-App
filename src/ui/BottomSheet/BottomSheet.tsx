import type { ReactNode } from "react";
import { Modal, Pressable, Text } from "react-native";

import { styles } from "./BottomSheet.styles";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Popup padrão do app pra qualquer decisão pontual (escolher uma opção, preencher um mini
 * formulário) sem sair da tela — sobe do rodapé, com fundo escurecido que fecha ao tocar fora.
 * Usado hoje pelo `SelectField` e por listas com "Adicionar" (ex: contatos de emergência).
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Pressable próprio (em vez de View) + stopPropagation: sem isso, um toque em
            qualquer área do sheet que não seja ela mesma interativa (ex: entre o label e o
            input de um TextField) borbulha pro Pressable do fundo e fecha o popup — foi
            exatamente o que quebrava o campo "Nome" do contato de emergência. */}
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
