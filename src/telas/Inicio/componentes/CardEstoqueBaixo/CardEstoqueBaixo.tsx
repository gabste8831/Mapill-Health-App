import { Pressable, Text, View } from "react-native";

import { styles } from "./CardEstoqueBaixo.styles";

type CardEstoqueBaixoProps = {
  medicationName: string;
  daysRemaining: number;
  onUpdateMedication?: () => void;
  onDismiss?: () => void;
};

/**
 * Alerta de estoque baixo — só aparece quando o próprio paciente ativou o lembrete pro
 * medicamento (`InventoryItem.lowStockAlertEnabled`). Nunca bloqueia a tela (ver
 * screens-and-flows.md: "estoque baixo" — controle total do usuário).
 */
export function CardEstoqueBaixo({
  medicationName,
  daysRemaining,
  onUpdateMedication,
  onDismiss,
}: CardEstoqueBaixoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Alerta de estoque</Text>
      </View>
      <View>
        <Text style={styles.medicationName}>{medicationName}</Text>
        <Text style={styles.daysRemaining}>{daysRemaining} dias restantes</Text>
      </View>
      <Pressable style={styles.primaryButton} onPress={onUpdateMedication} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>Atualizar medicação</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onDismiss} accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>Ignorar lembrete</Text>
      </Pressable>
    </View>
  );
}
