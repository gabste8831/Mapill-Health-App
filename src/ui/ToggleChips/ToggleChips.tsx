import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./ToggleChips.styles";

export type ToggleChipOption<TValue extends string> = {
  value: TValue;
  label: string;
};

export type ToggleChipsProps<TValue extends string> = {
  /** Vazio omite a linha de label, igual ao `TextField`. */
  label?: string;
  values: TValue[];
  options: ToggleChipOption<TValue>[];
  onChange: (values: TValue[]) => void;
};

/**
 * Escolha múltipla em chips. É o irmão do `OptionGroup` para quando as respostas se somam em vez
 * de se excluírem — e é o que substitui um campo de texto sempre que a lista de respostas é
 * conhecida: quem cadastra apressado não escreve "tomar em jejum", mas reconhece e toca.
 *
 * Não tem estado de "nenhuma escolhida" a preencher: lista vazia já é resposta válida.
 */
export function ToggleChips<TValue extends string>({
  label,
  values,
  options,
  onChange,
}: ToggleChipsProps<TValue>) {
  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() =>
                onChange(
                  isSelected
                    ? values.filter((value) => value !== option.value)
                    : [...values, option.value],
                )
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}>
              {/* O "certinho" desambigua marcado de apenas destacado — sem ele, um chip colorido
                  no meio de cinzas lê tanto como escolha quanto como sugestão do app. */}
              {isSelected ? (
                <Ionicons name="checkmark-sharp" size={14} color={colors.onPrimary} />
              ) : null}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
