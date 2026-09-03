import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";

import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./IconButton.styles";

/**
 * `sutil` é o ícone dentro de um cartão de lista: fundo neutro, sem borda, sem sombra.
 *
 * Existe porque as telas desenhavam esse botão à mão — em Remédios e no Calendário — e o
 * resultado era um ícone **sem fundo nenhum**, flutuando, diferenciado do vizinho só pela cor. O
 * sintoma que denunciava isso era o texto de apoio da tela precisar explicar em prosa o que os
 * ícones fazem: quando a interface precisa de legenda, ela falhou. O fundo é o que transforma um
 * ícone em algo que se reconhece como tocável.
 */
export type IconButtonVariant = "primary" | "outline" | "sutil";

/** `sm` é o alvo de dentro de cartão; `md` é o padrão, para ação isolada. */
export type IconButtonTamanho = "sm" | "md";

export type IconButtonProps = Omit<PressableProps, "style"> & {
  icon: ReactNode;
  variant?: IconButtonVariant;
  tamanho?: IconButtonTamanho;
  accessibilityLabel: string;
  /** Sobrescreve/soma estilo só nesta instância (ex: tamanho diferente pra um caso específico). */
  style?: StyleProp<ViewStyle>;
};

/** Botão circular só com ícone — usado em ações compactas (ex: "adicionar alergia", FAB). */
export function IconButton({
  icon,
  variant = "primary",
  tamanho = "md",
  disabled,
  style,
  ...pressableProps
}: IconButtonProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <Pressable
      style={estadoDePressao(
        [styles.base, styles[tamanho], styles[variant], disabled && styles.disabled, style],
        {
          escala: !disabled,
          opacidade: !disabled && variant !== "sutil",
          // O `sutil` não tem fundo próprio, então escurecê-lo por opacidade não mudaria nada
          // visível: quem responde ao toque aqui é o fundo que aparece.
          superficie: !disabled && variant === "sutil",
        },
      )}
      disabled={disabled}
      accessibilityRole="button"
      {...pressableProps}>
      {icon}
    </Pressable>
  );
}
