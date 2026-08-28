import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./Button.styles";

export type ButtonVariant = "primary" | "outline" | "text";

export type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  /** Ex: logo do Google no botão de login — renderizado antes do texto. */
  icon?: ReactNode;
  /**
   * Ligar dentro de um `BottomSheet`. Só afeta o `outline`, que ali fica sem contraste: a folha já
   * é superfície clara elevada, e a sombra do botão desaparece contra ela.
   */
  emFolha?: boolean;
  /** Sobrescreve/soma estilo só nesta instância, sem mexer no padrão do componente. */
  style?: StyleProp<ViewStyle>;
};

const VARIANT_LABEL_STYLE: Record<ButtonVariant, keyof typeof styles> = {
  primary: "primaryLabel",
  outline: "outlineLabel",
  text: "textLabel",
};

/**
 * Botão padrão do app — altura, raio e cores vêm de `Button.styles.ts` (um lugar só pra mudar
 * o padrão global). Pra mudar só uma instância específica, passe `style`.
 */
export function Button({ label, variant = "primary", loading = false, icon, emFolha = false, disabled, style, ...pressableProps }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        styles.base,
        styles[variant],
        variant === "outline" && emFolha && styles.outlineEmFolha,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onPrimary : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, styles[VARIANT_LABEL_STYLE[variant]]]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
