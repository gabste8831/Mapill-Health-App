import type { ReactNode } from "react";
import { Keyboard, Modal, Pressable, ScrollView, Text, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { spacing, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./BottomSheet.styles";

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
  const styles = useEstilos(criarEstilos);

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
   * Com o teclado aberto o inset não se aplica (a barra de gestos fica atrás dele), mas o respiro
   * continua precisando existir: sem ele o botão "Salvar" encosta direto na borda do teclado, sem
   * nenhuma separação visual entre os dois — o que lia como os elementos estarem "grudados" por
   * engano, e não como decisão de layout.
   */
  const respiroInferior =
    spacing.md + (keyboardHeight > 0 ? spacing.md : Math.max(insets.bottom, spacing.sm));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { paddingBottom: keyboardHeight }]} onPress={onClose}>
        {/* Pressable próprio (em vez de View) + stopPropagation: sem isso, um toque em
            qualquer área do sheet que não seja ela mesma interativa (ex: entre o label e o
            input de um TextField) borbulha pro Pressable do fundo e fecha o popup — foi
            exatamente o que quebrava o campo "Nome" do contato de emergência. */}
        <Pressable
          style={[styles.sheet, { maxHeight: alturaDisponivel }]}
          onPress={(event) => {
            event.stopPropagation();
            /**
             * Tocar numa área vazia do popup **fecha o teclado**.
             *
             * O `stopPropagation` sozinho fazia o toque morrer aqui: ele não fechava o popup (certo)
             * mas também não dispensava o teclado (errado). O resultado era um teclado grudado,
             * ocupando metade da tela, sem lugar nenhum onde tocar para dispensá-lo — nem fora do
             * popup, que fecha tudo, nem dentro, que não fazia nada.
             */
            Keyboard.dismiss();
          }}>
          <Text style={styles.title}>{title}</Text>
          {/* `handled` deixa o primeiro toque num botão valer mesmo com o teclado aberto; sem
              isso ele só fecharia o teclado e a pessoa teria que tocar de novo. */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            // Arrastar a lista fecha o teclado, que é o gesto que a pessoa faz quando quer ver o
            // que está embaixo dele.
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: respiroInferior }]}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
