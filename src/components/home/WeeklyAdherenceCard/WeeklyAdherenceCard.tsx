import { Text, View } from "react-native";

import { barRowHeight, styles } from "./WeeklyAdherenceCard.styles";

type WeeklyAdherenceDay = {
  label: string;
  /** 0 a 1 — proporção de doses confirmadas no dia. */
  ratio: number;
  isToday?: boolean;
};

type WeeklyAdherenceCardProps = {
  days: WeeklyAdherenceDay[];
  summary: string;
};

/** Mini-gráfico de barras sem lib externa — só Views com altura proporcional (ver styling.md). */
export function WeeklyAdherenceCard({ days, summary }: WeeklyAdherenceCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Acompanhamento semanal</Text>
      </View>
      <View style={styles.barsRow}>
        {days.map((day) => (
          <View key={day.label} style={styles.barColumn}>
            <View
              style={[
                styles.bar,
                day.isToday && styles.barToday,
                { height: Math.max(4, day.ratio * barRowHeight) },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labelsRow}>
        {days.map((day) => (
          <Text key={day.label} style={styles.dayLabel}>
            {day.label}
          </Text>
        ))}
      </View>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}
