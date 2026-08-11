import { forwardRef } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, spacing } from "@/shared/theme";
import { styles } from "./TextField.styles";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  /** Vazia (`""`) omite a linha de label — útil quando o campo já está rotulado por fora (ex: alergias). */
  label?: string;
  required?: boolean;
  /**
   * `string`: mensagem de erro exibida abaixo do campo, também deixa a borda vermelha.
   * `true`: só a borda vermelha, sem mensagem (ex: campos de um grupo que valida como um todo).
   */
  error?: string | boolean;
  /** Sobrescreve/soma estilo do input só nesta instância. */
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Campo de texto padrão do app: label + input + (opcional) mensagem de erro, sempre no mesmo
 * layout. Altura, borda e cores vêm de `TextField.styles.ts` — mudar ali afeta todo o app;
 * `style`/`containerStyle` ajustam só uma instância quando precisar.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, required, error, style, containerStyle, multiline, ...inputProps }, ref) => {
    return (
      <View style={[styles.fieldGroup, containerStyle]}>
        {label ? (
          <Text style={styles.fieldLabel}>
            {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && localStyles.multiline,
            error ? styles.inputError : null,
            style,
          ]}
          placeholderTextColor={colors.onSurfaceVariant}
          multiline={multiline}
          {...inputProps}
        />
        {typeof error === "string" && error.length > 0 ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
      </View>
    );
  },
);
TextField.displayName = "TextField";

// Só o ajuste de altura/alinhamento específico de multiline — não vale a pena estar no
// TextField.styles.ts compartilhado porque é condicional, não um "padrão" fixo.
const localStyles = StyleSheet.create({
  multiline: {
    height: 96,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
});
