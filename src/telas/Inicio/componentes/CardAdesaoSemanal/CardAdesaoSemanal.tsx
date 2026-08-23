import { Text, View } from "react-native";

import { barRowHeight, styles } from "./CardAdesaoSemanal.styles";

type DiaDeAdesao = {
  label: string;
  /** 0 a 1 — proporção de doses confirmadas no dia. `null` = não havia dose agendada. */
  ratio: number | null;
  isToday?: boolean;
};

type CardAdesaoSemanalProps = {
  days: DiaDeAdesao[];
  summary: string;
};

/** Mini-gráfico de barras sem lib externa — só Views com altura proporcional. */
export function CardAdesaoSemanal({ days, summary }: CardAdesaoSemanalProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Acompanhamento semanal</Text>
      </View>
      <View style={styles.barsRow}>
        {days.map((day, index) => (
          // A chave é o índice porque a mesma sigla pode se repetir na janela de sete dias.
          <View key={index} style={styles.barColumn}>
            {day.ratio === null ? (
              // Traço no lugar da barra: dia sem dose não é adesão zero, é ausência de dado.
              <View style={styles.barVazia} />
            ) : (
              <View
                style={[
                  styles.bar,
                  day.isToday && styles.barToday,
                  { height: Math.max(4, day.ratio * barRowHeight) },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <View style={styles.labelsRow}>
        {days.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>
            {day.label}
          </Text>
        ))}
      </View>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}
