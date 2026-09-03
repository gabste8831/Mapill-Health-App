import { forwardRef } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { spacing, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./TextField.styles";

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
    const styles = useEstilos(criarEstilos);
    const cores = useCores();

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
          // Mais sutil que o label (onSurfaceVariant) de propósito — o placeholder é uma dica,
          // não deve competir visualmente com o texto que o paciente já preencheu. Mas sem
          // opacidade: a 0.6 ele dava **2.38:1**, ilegível para quem tem baixa visão, e a dica de
          // um campo de dose é onde isso menos pode acontecer. Em cheio dá 5.09:1 e continua
          // claramente mais leve que o texto preenchido, que era o efeito pretendido.
          placeholderTextColor={cores.outline}
          multiline={multiline}
          /**
           * **A tecla do teclado fecha o teclado** — o gesto que faltava, junto do toque em área
           * vazia e do arrastar a lista.
           *
           * Só em campo de uma linha: em `multiline` o Enter é quebra de linha, e trocar isso
           * tiraria a única forma de escrever uma observação em dois parágrafos.
           *
           * Vem **antes** do spread, então uma tela que precise de outro comportamento (o
           * `SearchField` usa `"search"`) continua podendo mandar no seu.
           */
          {...(multiline ? {} : { returnKeyType: "done" as const, blurOnSubmit: true })}
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
