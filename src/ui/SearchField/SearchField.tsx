import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./SearchField.styles";

export type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Rótulo do botão de limpar pro leitor de tela — o X sozinho não diz o que apaga. */
  clearAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Campo de busca em formato de pílula, com a lupa à esquerda e o X pra limpar.
 *
 * Separado do `TextField` porque busca não é preenchimento: não tem label, não tem erro, não é
 * salva, e o formato arredondado é justamente o que a diferencia dos campos de formulário à
 * primeira vista.
 */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  clearAccessibilityLabel = "Limpar busca",
  style,
}: SearchFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={colors.outline} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />

      {/* Só com texto: um X permanente sugere que há algo a limpar quando não há. */}
      {value.length > 0 ? (
        <Pressable
          style={styles.clearButton}
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel={clearAccessibilityLabel}
          hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.outline} />
        </Pressable>
      ) : null}
    </View>
  );
}
