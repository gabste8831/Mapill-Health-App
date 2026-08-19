import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DoseListItem } from "@/components/home/DoseListItem/DoseListItem";
import { LowStockAlertCard } from "@/components/home/LowStockAlertCard/LowStockAlertCard";
import { NextDoseCard } from "@/components/home/NextDoseCard/NextDoseCard";
import { WeeklyAdherenceCard } from "@/components/home/WeeklyAdherenceCard/WeeklyAdherenceCard";
import { styles } from "./HomeScreen.styles";

// Dados de exemplo — a Home ainda não está ligada aos repositórios (próximo passo depois
// da UI validada). Formato já pensado pra bater com o que os use-cases vão devolver.
const MOCK_WEEK_DAYS = [
  { key: "dom", label: "DOM", day: 11 },
  { key: "seg", label: "SEG", day: 12, isToday: true },
  { key: "ter", label: "TER", day: 13 },
  { key: "qua", label: "QUA", day: 14 },
  { key: "qui", label: "QUI", day: 15 },
  { key: "sex", label: "SEX", day: 16 },
  { key: "sab", label: "SAB", day: 17 },
];

const MOCK_TODAY_DOSES = [
  { key: "1", time: "08:00", medicationName: "Lisinopril 10mg", note: "Tomado no café da manhã", status: "done" as const },
  { key: "2", time: "10:00", medicationName: "Ômega-3", note: "Dose confirmada", status: "done" as const },
  { key: "3", time: "14:30", medicationName: "Metformina 500mg", note: "Tomar com o almoço", status: "next" as const },
  { key: "4", time: "20:00", medicationName: "Atorvastatina 20mg", note: "Antes de dormir", status: "upcoming" as const },
];

const MOCK_WEEKLY_ADHERENCE = [
  { label: "SEG", ratio: 0.6 },
  { label: "TER", ratio: 0.8 },
  { label: "QUA", ratio: 0.7 },
  { label: "QUI", ratio: 0.9 },
  { label: "SEX", ratio: 0.85 },
  { label: "SAB", ratio: 0.95 },
  { label: "DOM", ratio: 1, isToday: true },
];

export function HomeScreen() {
  const router = useRouter();
  const dailyProgressRatio = 3 / 5;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={styles.dateLabel}>Segunda-feira, 12 de maio</Text>
            <Text style={styles.greeting}>Olá, David.</Text>
          </View>
          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>PROGRESSO DIÁRIO</Text>
              <Text style={styles.progressValue}>{Math.round(dailyProgressRatio * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${dailyProgressRatio * 100}%` }]} />
            </View>
            <Text style={styles.progressCaption}>3 de 5 doses concluídas hoje</Text>
          </View>
        </View>

        <NextDoseCard time="14:30" medicationLabel="Metformina 500mg (1 comprimido)" hint="Tomar com bastante água durante o almoço" />

        <View style={styles.weekSelector}>
          {MOCK_WEEK_DAYS.map((weekDay) => (
            <View key={weekDay.key} style={[styles.weekDay, weekDay.isToday && styles.weekDayActive]}>
              <Text style={[styles.weekDayLabel, weekDay.isToday && styles.weekDayLabelActive]}>{weekDay.label}</Text>
              <Text style={[styles.weekDayNumber, weekDay.isToday && styles.weekDayLabelActive]}>{weekDay.day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.doseList}>
          <Text style={styles.sectionLabel}>Segunda-feira · 12/05</Text>
          {MOCK_TODAY_DOSES.map((dose) => (
            <DoseListItem
              key={dose.key}
              time={dose.time}
              medicationName={dose.medicationName}
              note={dose.note}
              status={dose.status}
            />
          ))}
        </View>

        <LowStockAlertCard medicationName="Lisinopril" daysRemaining={4} />

        <Pressable style={styles.manageStockButton} accessibilityRole="button">
          <Text style={styles.manageStockButtonText}>Gerenciar estoques</Text>
        </Pressable>

        <WeeklyAdherenceCard days={MOCK_WEEKLY_ADHERENCE} summary="Adesão de 100% mantida nesta semana." />
      </ScrollView>

      <Pressable
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Cadastrar medicação ou compromisso"
        onPress={() => router.push("/cadastro/escolha")}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
