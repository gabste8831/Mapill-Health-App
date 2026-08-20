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
