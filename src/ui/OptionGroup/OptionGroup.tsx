import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "./OptionGroup.styles";

export type OptionGroupOption<TValue extends string> = {
  value: TValue;
  label: string;
  /** Linha de apoio. Só faz sentido em `layout="coluna"`, onde há largura pra ela. */
  hint?: string;
};

export type OptionGroupProps<TValue extends string> = {
  /** Vazio omite a linha de label, igual ao `TextField`. */
  label?: string;
  value: TValue | null;
  options: OptionGroupOption<TValue>[];
  onChange: (value: TValue) => void;
  /**
   * `linha` embrulha opções curtas lado a lado; `grade` fixa duas colunas, pra rótulo médio não
   * virar quatro linhas empilhadas; `coluna` empilha e dá espaço pro `hint`.
   */
  layout?: "linha" | "grade" | "coluna";
  /**
   * Entra no fim da fileira, junto das opções. Existe pro caso "as opções cobrem o comum, e o
   * resto se digita" — a alternativa era um botão "Mais" que revela um campo em outra linha, e
   * gastar dois toques e duas linhas pra dizer um número.
   */
  trailing?: ReactNode;
};

const CONTAINER_STYLE = {
  linha: "row",
  grade: "grid",
  coluna: "column",
} as const;

const OPTION_STYLE = {
  linha: "optionInline",
  grade: "optionGrid",
  coluna: "optionStacked",
} as const;

/**
 * Escolha única resolvida em um toque, com as opções à vista. Existe ao lado do `SelectField`
 * porque os dois resolvem problemas diferentes: o select esconde a lista pra caber (tipo
 * sanguíneo, 8 opções), este mostra tudo quando são poucas e a comparação entre elas é a
 * decisão — "contínuo ou com prazo" se responde vendo as duas juntas, não abrindo um popup.
 */
export function OptionGroup<TValue extends string>({
  label,
  value,
  options,
  onChange,
  layout = "linha",
  trailing,
}: OptionGroupProps<TValue>) {
  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles[CONTAINER_STYLE[layout]]}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                styles[OPTION_STYLE[layout]],
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              {option.hint && layout === "coluna" ? (
                <Text style={[styles.optionHint, isSelected && styles.optionHintSelected]}>
                  {option.hint}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        {trailing}
      </View>
    </View>
  );
}
