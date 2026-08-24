import { Pressable, Text } from "react-native";

import { styles } from "./Fab.styles";

export type FabProps = {
  onPress: () => void;
  /** Sempre específico: "Cadastrar medicação" diz mais que "Adicionar" para quem usa leitor de tela. */
  accessibilityLabel: string;
};

/**
 * O botão de cadastrar, no canto inferior direito. Fica no kit porque **toda aba que lista algo
 * precisa dele**: quem está olhando a lista de remédios e quer cadastrar outro não deveria ter que
 * voltar para a Home só para achar o botão — o lugar de criar é onde se está vendo o que já existe.
 *
 * O destino muda por tela e por isso não mora aqui: em Remédios ele já sabe que é medicação, no
 * Calendário ainda não sabe se é compromisso ou remédio.
 */
export function Fab({ onPress, accessibilityLabel }: FabProps) {
  return (
    <Pressable
      style={styles.fab}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}>
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}
