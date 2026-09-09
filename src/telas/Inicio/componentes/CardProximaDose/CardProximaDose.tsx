import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardProximaDose.styles";

type CardProximaDoseProps = {
  time: string;
  /** O nome do remédio, sozinho. A dose vem separada: são duas linhas, não uma frase. */
  medicationName: string;
  /** A quantidade já formatada ("1 comprimido"). */
  doseLabel: string;
  hint: string | null;
};

/** Card de maior destaque da Home — única quebra intencional da paleta neutra. */
export function CardProximaDose({ time, medicationName, doseLabel, hint }: CardProximaDoseProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      {/* Antes do conteúdo para ficar **atrás**: no React Native a ordem no JSX é a ordem de
          pintura. Escondida do leitor de tela — ela repete o ícone do cabeçalho, e anunciá-la seria
          dizer a mesma coisa duas vezes. */}
      <MaterialCommunityIcons
        name="pill"
        size={150}
        color={cores.onPrimary}
        style={styles.marcaDagua}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <View style={styles.conteudo}>
        {/* O rótulo e a hora andam juntos: "Próxima dose" nomeia o número logo abaixo, e afastá-lo
            dele o deixava boiando entre o topo do card e um horário distante. Sem `gap` entre os
            dois — o `lineHeight` do horário já abre o bastante. */}
        <View>
          <View style={styles.header}>
            <View style={styles.headerEsquerda}>
              <View style={styles.seloDoRotulo}>
                <MaterialCommunityIcons name="pill" size={13} color={cores.onPrimary} />
              </View>
              <Text style={styles.label}>Próxima dose</Text>
            </View>
          </View>

          <Text style={styles.time}>{time}</Text>
        </View>

        {/* Uma linha por informação, e não "Dipirona (1 comprimido)" numa frase só: o nome e a
            quantidade são coisas diferentes, e empilhadas cada uma tem o próprio peso.

            O nome e a dose ficam num bloco à parte do horário: são duas perguntas diferentes
            ("quando?" e "o quê?"), e o vão entre elas é o que diz isso sem precisar de rótulo. */}
        <View style={styles.remedio}>
          <Text style={styles.medication}>{medicationName}</Text>
          <Text style={styles.dose}>{doseLabel}</Text>
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
