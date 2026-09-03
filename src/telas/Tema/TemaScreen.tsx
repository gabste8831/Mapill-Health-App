import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEstilos } from "@/shared/theme";
import { Header } from "@/ui";
import { SeletorDeAparencia } from "@/telas/Ajustes/componentes/SeletorDeAparencia/SeletorDeAparencia";
import { criarEstilos } from "./TemaScreen.styles";

export type TemaScreenProps = {
  onBack: () => void;
};

/**
 * A escolha de aparência do app, isolada em tela própria.
 *
 * Morava dentro de Ajustes, expandida — mas o seletor completo (5 linhas com amostra, nome e
 * descrição) é o bloco mais alto da tela, e a maioria de quem abre Ajustes está atrás de outra
 * coisa (conta, dados). Um botão em Acessibilidade que leva pra cá deixa Ajustes como um menu
 * curto de novo, e ainda dá um nome à seção pra quem chega já sabendo que quer isto.
 */
export function TemaScreen({ onBack }: TemaScreenProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Configurações de tema" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SeletorDeAparencia />
        <Text style={styles.hint}>
          O tema Padrão é o visual do Mapill. Os demais são alternativas de acessibilidade, a
          escolha fica salva neste aparelho.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
