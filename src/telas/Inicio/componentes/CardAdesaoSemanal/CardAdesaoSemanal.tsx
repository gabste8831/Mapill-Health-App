import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { barRowHeight, criarEstilos } from "./CardAdesaoSemanal.styles";

type DiaDeAdesao = {
  label: string;
  /** 0 a 1 — proporção de doses confirmadas no dia. `null` = não havia dose agendada. */
  ratio: number | null;
  isToday?: boolean;
};

type CardAdesaoSemanalProps = {
  days: DiaDeAdesao[];
  summary: string;
  /** Abre o relatório completo. Ausente deixa o card só informativo, como era antes. */
  onAbrirRelatorio?: () => void;
};

/**
 * Mini-gráfico de barras sem lib externa — só Views com altura proporcional.
 *
 * Virou porta de entrada do relatório de adesão: sete barras respondem "como foi a semana", e quem
 * quer saber mais já está olhando exatamente para o lugar certo. Sem isso, o relatório precisaria
 * de um item novo em algum menu — e a pergunta que ele responde nasce aqui.
 */
export function CardAdesaoSemanal({ days, summary, onAbrirRelatorio }: CardAdesaoSemanalProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      // Card de largura total, e só responde quando há relatório a abrir: reagir ao toque sem
      // `onAbrirRelatorio` prometeria uma navegação que não acontece.
      style={estadoDePressao(styles.container, { opacidade: onAbrirRelatorio !== undefined })}
      onPress={onAbrirRelatorio}
      disabled={onAbrirRelatorio === undefined}
      accessibilityRole={onAbrirRelatorio ? "button" : undefined}
      accessibilityLabel={onAbrirRelatorio ? "Ver meu relatório de adesão" : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Acompanhamento semanal</Text>
        {onAbrirRelatorio ? (
          <Ionicons name="chevron-forward" size={18} color={cores.onSurfaceVariant} />
        ) : null}
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
    </Pressable>
  );
}
