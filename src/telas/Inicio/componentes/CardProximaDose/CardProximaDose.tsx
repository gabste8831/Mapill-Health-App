import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardProximaDose.styles";

type CardProximaDoseProps = {
  time: string;
  medicationLabel: string;
  hint: string | null;
};

/** Card de maior destaque da Home — única quebra intencional da paleta neutra. */
export function CardProximaDose({ time, medicationLabel, hint }: CardProximaDoseProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      {/* Antes do conteúdo para ficar **atrás**: no React Native a ordem no JSX é a ordem de
          pintura. Escondida do leitor de tela — ela repete o ícone do cabeçalho, e anunciá-la seria
          dizer a mesma coisa duas vezes. */}
      <Ionicons
        name="medical"
        size={150}
        color={cores.onPrimary}
        style={styles.marcaDagua}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <View style={styles.conteudo}>
        <View style={styles.header}>
          <View style={styles.headerEsquerda}>
            <View style={styles.seloDoRotulo}>
              <Ionicons name="medical" size={13} color={cores.onPrimary} />
            </View>
            <Text style={styles.label}>Próxima dose</Text>
          </View>
        </View>

        <View>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.medication}>{medicationLabel}</Text>
        </View>

        {hint ? (
          <View style={styles.hintRow}>
            {/* O ícone entra junto do texto, como na referência: a orientação é a única linha do
                card que pede atenção além do horário, e o marcador é o que a separa dele. */}
            <Ionicons name="information-circle-outline" size={16} color={cores.onPrimary} />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
