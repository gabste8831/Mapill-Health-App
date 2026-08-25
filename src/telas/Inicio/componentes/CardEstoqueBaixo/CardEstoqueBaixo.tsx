import { Pressable, Text, View } from "react-native";

import { styles } from "./CardEstoqueBaixo.styles";

type CardEstoqueBaixoProps = {
  medicationName: string;
  daysRemaining: number;
  onAbrirEstoque: () => void;
};

/**
 * Alerta de estoque baixo — só aparece se o paciente ativou o lembrete pro medicamento
 * (`InventoryItem.lowStockAlertEnabled`), e nunca bloqueia a tela.
 */
export function CardEstoqueBaixo({
  medicationName,
  daysRemaining,
  onAbrirEstoque,
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
      {/* Só o caminho que resolve o aviso. O "ignorar lembrete" que existia aqui não tinha para
          onde ir: nada guardava a dispensa, e o card voltava igual na abertura seguinte. */}
      <Pressable style={styles.primaryButton} onPress={onAbrirEstoque} accessibilityRole="button">
        <Text style={styles.primaryButtonText}>Abrir estoque</Text>
      </Pressable>
    </View>
  );
}
