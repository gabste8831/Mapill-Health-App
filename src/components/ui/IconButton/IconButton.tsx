import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";

import { styles } from "./IconButton.styles";

export type IconButtonVariant = "primary" | "outline";

export type IconButtonProps = Omit<PressableProps, "style"> & {
  icon: ReactNode;
  variant?: IconButtonVariant;
  accessibilityLabel: string;
  /** Sobrescreve/soma estilo só nesta instância (ex: tamanho diferente pra um caso específico). */
  style?: StyleProp<ViewStyle>;
};

/** Botão circular só com ícone — usado em ações compactas (ex: "adicionar alergia", FAB). */
export function IconButton({ icon, variant = "primary", disabled, style, ...pressableProps }: IconButtonProps) {
  return (
    <Pressable
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      disabled={disabled}
      accessibilityRole="button"
      {...pressableProps}>
      {icon}
    </Pressable>
  );
}
