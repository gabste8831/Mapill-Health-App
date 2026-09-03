import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardEstoqueBaixo.styles";

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
  const styles = useEstilos(criarEstilos);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Alerta de estoque</Text>
      </View>
      {/* Agrupado para o alerta ser lido como uma frase — "Losartana, 3 dias restantes" — em vez
          de dois nós soltos que só fazem sentido juntos. */}
      <View
        accessible
        accessibilityLabel={`${medicationName}, ${daysRemaining} dias restantes`}>
        <Text style={styles.medicationName}>{medicationName}</Text>
        <Text style={styles.daysRemaining}>{daysRemaining} dias restantes</Text>
      </View>
      {/* Só o caminho que resolve o aviso. O "ignorar lembrete" que existia aqui não tinha para
          onde ir: nada guardava a dispensa, e o card voltava igual na abertura seguinte. */}
      <Pressable
        style={estadoDePressao(styles.primaryButton, { escala: true })}
        onPress={onAbrirEstoque}
        accessibilityRole="button"
        // O rótulo carrega o medicamento: "Abrir estoque" sozinho, lido longe do card, não diz de
        // quê.
        accessibilityLabel={`Abrir o estoque de ${medicationName}`}>
        <Text style={styles.primaryButtonText}>Abrir estoque</Text>
      </Pressable>
    </View>
  );
}
