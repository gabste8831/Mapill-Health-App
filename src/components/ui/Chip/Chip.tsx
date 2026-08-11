import { Pressable, Text, View } from "react-native";

import { styles } from "./Chip.styles";

export type ChipProps = {
  label: string;
  /** Se ausente, o chip não mostra o "×" de remover — vira só um chip informativo. */
  onRemove?: () => void;
};

/** Chip removível — usado hoje em alergias, reutilizável pra qualquer lista curta de tags. */
export function Chip({ label, onRemove }: ChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
      {onRemove ? (
        <Pressable
          style={styles.chipRemove}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${label}`}>
          <Text style={styles.chipRemoveText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
