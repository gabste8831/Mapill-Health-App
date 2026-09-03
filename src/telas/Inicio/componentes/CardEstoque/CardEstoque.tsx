import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardEstoque.styles";

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
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      // Card de largura total: escurece sem encolher.
      style={estadoDePressao(styles.container)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir o estoque das suas medicações">
      <View style={styles.icone}>
        <Ionicons name="cube" size={22} color={cores.primary} />
      </View>

      <View style={styles.texto}>
        <Text style={styles.titulo}>Estoque</Text>
        {/* O convite entra no fim da frase: a contagem sozinha diz o que existe, mas não que o card
            leva a algum lugar — e a seta da direita é a única outra pista disso. */}
        <Text style={styles.descricao}>
          {quantidade === 1
            ? "1 medicação com estoque controlado, toque para gerenciar"
            : `${quantidade} medicações com estoque controlado, toque para gerenciar`}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={cores.outline} />
    </Pressable>
  );
}
