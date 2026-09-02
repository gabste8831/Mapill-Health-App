import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { colors, estadoDePressao } from "@/shared/theme";
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
export function Button({ label, variant = "primary", loading = false, icon, emFolha = false, disabled, style, accessibilityState, ...pressableProps }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      /**
       * O toque responde: escurece e encolhe um pouco.
       *
       * `escala` é seguro aqui porque um botão é alvo autocontido — mesmo o de largura total, que
       * tem margem dos dois lados e não faz o texto vizinho tremer.
       *
       * Desabilitado não reage: já está a 50% de opacidade, e responder ao toque prometeria uma
       * ação que não vai acontecer.
       */
      style={estadoDePressao(
        [
          styles.base,
          styles[variant],
          variant === "outline" && emFolha && styles.outlineEmFolha,
          isDisabled && styles.disabled,
          style,
        ],
        { escala: !isDisabled, opacidade: !isDisabled },
      )}
      disabled={isDisabled}
      accessibilityRole="button"
      /**
       * O estado de quem chama é **mesclado**, não substituído.
       *
       * Antes `accessibilityState` era fixo aqui e o spread vinha depois, então quem passasse
       * `{ selected: true }` apagava o `disabled` sem perceber — e um botão desabilitado deixava
       * de ser anunciado como tal. Botão que o leitor de tela apresenta como tocável e não
       * responde ao toque ensina a desconfiar da interface inteira.
       */
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
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
