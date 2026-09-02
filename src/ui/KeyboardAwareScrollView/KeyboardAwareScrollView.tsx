import { forwardRef } from "react";
import type { ScrollView as ScrollViewType, ScrollViewProps } from "react-native";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

/**
 * `ScrollView` de formulário: `KeyboardAvoidingView` com o `behavior` certo por plataforma.
 * O autoscroll até o campo focado vem de `useScrollToFocusedInput`.
 */
export const KeyboardAwareScrollView = forwardRef<ScrollViewType, ScrollViewProps>(
  ({ children, ...scrollViewProps }, ref) => {
    return (
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/**
         * `keyboardDismissMode="on-drag"` e `keyboardShouldPersistTaps="handled"` vêm **antes** do
         * spread, então uma tela pode sobrescrevê-los — mas nenhuma precisa, e é por isso que eles
         * moram aqui.
         *
         * Juntos resolvem o teclado grudado: arrastar a lista o dispensa (o gesto de quem quer ver
         * o que está embaixo), e `handled` faz o primeiro toque num botão valer, em vez de ser
         * gasto só fechando o teclado. Sem os dois, preencher um campo e querer ler o resto do
         * formulário virava um beco: metade da tela ocupada e nenhum lugar onde tocar.
         */}
        <ScrollView
          ref={ref}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}>
          {/**
           * **Tocar em área vazia dispensa o teclado** — o terceiro gesto, e o que faltava.
           *
           * O app tinha só dois saídas: arrastar a lista e tocar direto noutro controle. Faltava
           * justamente a que as pessoas tentam primeiro, e o relato foi exatamente esse: "preciso
           * clicar em qualquer lugar da tela pro teclado sumir". Quando o formulário não rola (ou
           * já está no fim), não havia saída nenhuma.
           *
           * `accessible={false}` porque isto **não é um controle**: é a área de fundo, e anunciá-la
           * como botão ao leitor de tela acrescentaria uma parada sem significado entre os campos.
           *
           * Não conflita com `keyboardShouldPersistTaps="handled"`: aquele decide o que acontece
           * quando o toque encontra um controle; este só age no toque que não encontrou nenhum.
           */}
          <Pressable onPress={() => Keyboard.dismiss()} accessible={false}>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  },
);
KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView";

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
  },
});
