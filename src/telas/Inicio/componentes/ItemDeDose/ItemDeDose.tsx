import { Pressable, Text, View } from "react-native";

import { styles } from "./ItemDeDose.styles";

export type ItemDeDoseStatus = "done" | "next" | "upcoming";

type ItemDeDoseProps = {
  time: string;
  medicationName: string;
  note: string;
  status: ItemDeDoseStatus;
  onConfirm?: () => void;
};

const STATUS_LABEL: Record<ItemDeDoseStatus, string> = {
  done: "CONCLUÍDA",
  next: "PRÓXIMA DOSE",
  upcoming: "A SEGUIR",
};

/** Uma linha da lista de doses do dia — três estados visuais (ver styling.md: "Lista de doses"). */
export function ItemDeDose({ time, medicationName, note, status, onConfirm }: ItemDeDoseProps) {
  return (
    <View style={[styles.base, status === "next" && styles.highlighted, status === "done" && styles.done]}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>
        <Text style={[styles.statusLabel, status === "upcoming" && styles.statusLabelUpcoming]}>
          {STATUS_LABEL[status]}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.medicationName, status === "done" && styles.medicationNameDone]}>
          {medicationName}
        </Text>
        <Text style={styles.note}>{note}</Text>
      </View>
      {status === "next" ? (
        <Pressable style={styles.confirmButton} onPress={onConfirm} accessibilityRole="button">
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
