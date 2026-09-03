import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";

import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./Card.styles";

export type CardProps = {
  children: ReactNode;
  /** Sobrescreve/soma estilo só nesta instância. */
  style?: StyleProp<ViewStyle>;
};

/** Bloco de agrupamento padrão (borda + fundo + cantos) — usado pra separar seções de formulário. */
export function Card({ children, style }: CardProps) {
  const styles = useEstilos(criarEstilos);

  return <View style={[styles.card, style]}>{children}</View>;
}
