import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./CardEstoque.styles";

type CardEstoqueProps = {
  /** Quantos remédios têm estoque controlado — é o que o card promete mostrar do outro lado. */
  quantidade: number;
  onPress: () => void;
};

/**
 * Porta de entrada permanente para o estoque, na Home.
 *
 * O acesso morava só num ícone no topo da aba Medicações, e o teste em aparelho mostrou que
 * ninguém o encontrava. Um ícone sem rótulo depende de a pessoa já saber que ele existe — e quem
 * precisa conferir quanto resta de um remédio normalmente está justamente na Home.
 *
 * Diferente do `CardEstoqueBaixo`, este não é alerta: ele não muda de cor nem cobra ação, e some
 * por completo quando não há estoque controlado, em vez de convidar para uma tela vazia.
 */
export function CardEstoque({ quantidade, onPress }: CardEstoqueProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir o estoque das suas medicações">
      <View style={styles.icone}>
        <Ionicons name="cube" size={22} color={colors.primary} />
      </View>

      <View style={styles.texto}>
        <Text style={styles.titulo}>Estoque</Text>
        <Text style={styles.descricao}>
          {quantidade === 1
            ? "1 medicação com estoque controlado"
            : `${quantidade} medicações com estoque controlado`}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
}
