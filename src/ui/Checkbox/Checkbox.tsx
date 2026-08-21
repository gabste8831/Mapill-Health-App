import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./Checkbox.styles";

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto simples ou JSX (ex: com um trecho em negrito/link) — a área de toque cobre tudo. */
  label: ReactNode;
  accessibilityLabel: string;
};

/**
 * Checkbox padrão do app — toda a linha (quadrado + label) é clicável, não só o quadrado, pra
 * facilitar o toque (relevante pro público idoso/polimedicado do Mapill).
 */
export function Checkbox({ checked, onChange, label, accessibilityLabel }: CheckboxProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark-sharp" size={16} color={colors.onPrimary} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
