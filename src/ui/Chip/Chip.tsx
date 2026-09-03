import { Pressable, Text, View } from "react-native";

import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./Chip.styles";

export type ChipProps = {
  label: string;
  /** Se ausente, o chip não mostra o "×" de remover — vira só um chip informativo. */
  onRemove?: () => void;
};

/** Chip removível — usado hoje em alergias, reutilizável pra qualquer lista curta de tags. */
export function Chip({ label, onRemove }: ChipProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
      {onRemove ? (
        <Pressable
          style={styles.chipRemove}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remover ${label}`}
          // O "×" desenhado é pequeno de propósito — crescer o botão incharia a chip inteira. O
          // `hitSlop` leva a área tocável de 20 para 44 sem mudar nada do que se vê, que é o jeito
          // certo de resolver alvo apertado em ação destrutiva.
          hitSlop={12}>
          <Text style={styles.chipRemoveText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
