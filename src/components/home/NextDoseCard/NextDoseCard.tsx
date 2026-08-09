import { Text, View } from "react-native";

import { styles } from "./NextDoseCard.styles";

type NextDoseCardProps = {
  time: string;
  medicationLabel: string;
  hint: string | null;
};

/** Card de maior destaque da Home — única quebra intencional da paleta neutra (ver styling.md). */
export function NextDoseCard({ time, medicationLabel, hint }: NextDoseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Próxima dose</Text>
      </View>
      <View>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.medication}>{medicationLabel}</Text>
      </View>
      {hint ? (
        <View style={styles.hintRow}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </View>
  );
}
