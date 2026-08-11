import { forwardRef } from "react";
import type { ScrollView as ScrollViewType, ScrollViewProps } from "react-native";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

/**
 * `ScrollView` pronto pra formulários: soma `KeyboardAvoidingView` (comportamento correto por
 * plataforma) com o autoscroll até o campo focado. Usar junto com `useScrollToFocusedInput`
 * (`src/hooks/use-scroll-to-focused-input.ts`) — repassar `scrollViewRef` no `ref` daqui e
 * `scrollToFocusedInput` no `onFocus` de cada `TextInput` da tela.
 *
 * Padrão do app pra qualquer tela com formulário daqui pra frente (ver `PatientProfileScreen`
 * pro primeiro uso) — evita reimplementar o mesmo `KeyboardAvoidingView` em cada tela nova.
 */
export const KeyboardAwareScrollView = forwardRef<ScrollViewType, ScrollViewProps>(
  ({ children, ...scrollViewProps }, ref) => {
    return (
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView ref={ref} {...scrollViewProps}>
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
