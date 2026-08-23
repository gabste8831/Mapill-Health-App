import { Pressable, Text, View } from "react-native";

import type { DoseVisualStatus } from "@/hooks/use-today-doses";
import { styles } from "./ItemDeDose.styles";

type ItemDeDoseProps = {
  time: string;
  medicationName: string;
  /** Dose e orientação — "1 comprimido · com bastante água". */
  note: string;
  status: DoseVisualStatus;
  onConfirm: () => void;
  onSkip: () => void;
  /** Tocar numa dose já resolvida abre a correção retroativa. */
  onCorrect: () => void;
};

const STATUS_LABEL: Record<DoseVisualStatus, string> = {
  confirmed: "TOMADA",
  skipped: "PULADA",
  late: "ATRASADA",
  next: "PRÓXIMA DOSE",
  upcoming: "A SEGUIR",
};

/**
 * Uma linha da agenda do dia.
 *
 * Só a próxima e as atrasadas mostram os botões de ação: oferecer "confirmar" numa dose das 22h às
 * 8 da manhã convida a marcar o que ainda não aconteceu, e o app passaria a registrar intenção em
 * vez de ingestão.
 */
export function ItemDeDose({
  time,
  medicationName,
  note,
  status,
  onConfirm,
  onSkip,
  onCorrect,
}: ItemDeDoseProps) {
  const resolvida = status === "confirmed" || status === "skipped";
  const acionavel = status === "next" || status === "late";

  return (
    <Pressable
      style={[
        styles.base,
        status === "next" && styles.highlighted,
        status === "late" && styles.late,
        resolvida && styles.done,
      ]}
      onPress={resolvida ? onCorrect : undefined}
      accessibilityRole={resolvida ? "button" : undefined}
      accessibilityLabel={resolvida ? `Corrigir registro de ${medicationName}` : undefined}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>
        <Text
          style={[
            styles.statusLabel,
            status === "upcoming" && styles.statusLabelUpcoming,
            status === "late" && styles.statusLabelLate,
          ]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.medicationName, status === "skipped" && styles.medicationNameSkipped]}>
          {medicationName}
        </Text>
        <Text style={styles.note}>{note}</Text>
      </View>

      {acionavel ? (
        <View style={styles.actions}>
          <Pressable
            style={styles.confirmButton}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar ${medicationName}`}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </Pressable>
          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={`Pular ${medicationName}`}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}
