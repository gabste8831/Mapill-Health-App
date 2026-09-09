import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardDeAtalho.styles";

type CardEstoqueProps = {
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
export function CardEstoque({ onPress }: CardEstoqueProps) {
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
        <Ionicons name="cube" size={22} color={cores.corDeDestaque} />
      </View>

      {/* Só o título.

          O subtítulo dizia o que o rótulo da seção acima já diz, e a contagem que ele carregava não
          muda o que a pessoa faz aqui: com uma medicação ou com seis, o toque leva à mesma tela — e
          o número exato está do outro lado. Sem ele o card cai de três linhas para uma, e passa a
          ler como o que é: um atalho, não um aviso. */}
      <Text style={styles.titulo}>Gerenciar estoque</Text>

      {/* Azul como o texto: num atalho contornado, a seta cinza parecia desligada. */}
      <Ionicons name="chevron-forward" size={18} color={cores.corDeDestaque} />
    </Pressable>
  );
}
