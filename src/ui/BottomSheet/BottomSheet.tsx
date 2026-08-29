import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { spacing } from "@/shared/theme";
import { styles } from "./BottomSheet.styles";

/** Quanto da tela o popup pode ocupar, com o teclado fechado. O resto fica de respiro no topo. */
const ALTURA_MAXIMA = 0.85;

/** Piso pro caso de teclado alto em tela pequena: abaixo disso o popup deixa de ser usável. */
const ALTURA_MINIMA = 220;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Popup padrão do app pra qualquer decisão pontual (escolher uma opção, preencher um mini
 * formulário) sem sair da tela — sobe do rodapé, com fundo escurecido que fecha ao tocar fora.
 *
 * Ele mesmo se ajusta ao teclado: `KeyboardAvoidingView` não resolveria aqui porque o `Modal`
 * abre em outra janela no Android, que não recebe o redimensionamento da activity — o campo
 * ficava embaixo do teclado e a pessoa digitava sem ver o que escrevia. A altura real do teclado
 * empurra o popup pra cima, e o conteúdo rola dentro do que sobrou.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const keyboardHeight = useKeyboardHeight();
  const { height: alturaDaTela } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const alturaDisponivel = Math.max(
    ALTURA_MINIMA,
    alturaDaTela * ALTURA_MAXIMA - keyboardHeight,
  );

  /**
   * O respiro do fim do conteúdo. O popup encosta na base da tela, onde ainda ficam a barra de
   * gestos e o queixo do aparelho — e o último elemento costuma ser justamente o botão que confirma
   * a decisão. Com só um `padding` fixo ele ficava rente à borda, difícil de acertar e fácil de
   * confundir com o gesto de voltar do sistema.
   *
   * Com o teclado aberto o inset não se aplica: a barra de gestos fica atrás do teclado, e somá-la
   * empurraria o conteúdo para longe do dedo sem motivo.
   */
  const respiroInferior =
    spacing.md + (keyboardHeight > 0 ? 0 : Math.max(insets.bottom, spacing.sm));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { paddingBottom: keyboardHeight }]} onPress={onClose}>
        {/* Pressable próprio (em vez de View) + stopPropagation: sem isso, um toque em
            qualquer área do sheet que não seja ela mesma interativa (ex: entre o label e o
            input de um TextField) borbulha pro Pressable do fundo e fecha o popup — foi
            exatamente o que quebrava o campo "Nome" do contato de emergência. */}
        <Pressable
          style={[styles.sheet, { maxHeight: alturaDisponivel }]}
          onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {/* `handled` deixa o primeiro toque num botão valer mesmo com o teclado aberto; sem
              isso ele só fecharia o teclado e a pessoa teria que tocar de novo. */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: respiroInferior }]}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
