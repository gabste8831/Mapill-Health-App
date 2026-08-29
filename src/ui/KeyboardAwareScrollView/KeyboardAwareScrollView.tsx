import { forwardRef } from "react";
import type { ScrollView as ScrollViewType, ScrollViewProps } from "react-native";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

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
          {children}
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
