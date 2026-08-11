import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { colors } from "@/shared/theme";
import { styles } from "./SelectField.styles";

export type SelectOption<TValue extends string> = { value: TValue; label: string };

export type SelectFieldProps<TValue extends string> = {
  label: string;
  placeholder?: string;
  value: TValue | null;
  options: SelectOption<TValue>[];
  onChange: (value: TValue | null) => void;
};

/**
 * Campo "select": em vez de abrir o teclado, abre um `BottomSheet` com as opções. Usado onde
 * antes existiam fileiras de chips (tipo sanguíneo, sexo biológico) — mais compacto e mais
 * fácil de escanear visualmente.
 */
export function SelectField<TValue extends string>({
  label,
  placeholder = "Selecionar",
  value,
  options,
  onChange,
}: SelectFieldProps<TValue>) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={styles.selectField}
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Selecionar ${label.toLowerCase()}`}>
        <Text style={selectedOption ? styles.selectFieldValue : styles.selectFieldPlaceholder}>
          {selectedOption?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
      </Pressable>

      <BottomSheet visible={isPickerOpen} onClose={() => setPickerOpen(false)} title={label}>
        {value !== null ? (
          <Pressable
            style={styles.modalOption}
            onPress={() => {
              onChange(null);
              setPickerOpen(false);
            }}>
            <Text style={styles.modalOptionTextMuted}>Limpar seleção</Text>
          </Pressable>
        ) : null}
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={styles.modalOption}
            onPress={() => {
              onChange(option.value);
              setPickerOpen(false);
            }}
            accessibilityRole="button">
            <Text style={option.value === value ? styles.modalOptionTextSelected : styles.modalOptionText}>
              {option.label}
            </Text>
            {option.value === value ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}
