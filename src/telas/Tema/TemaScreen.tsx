import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEstilos } from "@/shared/theme";
import { SeletorDeAparencia } from "@/telas/Ajustes/componentes/SeletorDeAparencia/SeletorDeAparencia";
import { SeletorDeCoresDeEstado } from "@/telas/Ajustes/componentes/SeletorDeCoresDeEstado/SeletorDeCoresDeEstado";
import { Header } from "@/ui";
import { criarEstilos } from "./TemaScreen.styles";

export type TemaScreenProps = {
  onBack: () => void;
};

/**
 * A escolha de aparência do app, isolada em tela própria.
 *
 * Morava dentro de Ajustes, expandida — mas o seletor completo é o bloco mais alto da tela, e a
 * maioria de quem abre Ajustes está atrás de outra coisa (conta, dados). Um botão em
 * Acessibilidade que leva pra cá deixa Ajustes como um menu curto de novo.
 *
 * ## Duas perguntas, e não uma
 *
 * **Aparência** é gosto e conforto: claro, escuro, alto contraste. **Preferências visuais** é
 * necessidade: quais cores o app usa para dizer "tudo certo", "fique atento" e "urgente". As duas
 * são independentes de propósito — quem não distingue verde de vermelho também usa o app à noite,
 * e antes precisava abrir mão do tema escuro para enxergar os estados.
 */
export function TemaScreen({ onBack }: TemaScreenProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Configurações de tema" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* A explicação vem **antes** das opções, e não como rodapé: ela diz o que as duas seções
            seguintes fazem, e lida depois já não serve para escolher. */}
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Escolha o melhor esquema de cores para você. Em Aparência você define o visual do
            aplicativo; em Preferências visuais estão os ajustes para quem tem dificuldade em
            distinguir certas cores.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotuloDaSecao}>Aparência</Text>
          <SeletorDeAparencia />
        </View>

        {/* Tudo num cartão só, como em Aparência: o texto explica as opções logo abaixo dele, e
            separá-los em blocos fazia a explicação parecer um assunto e as opções, outro. */}
        <View style={styles.secao}>
          <Text style={styles.rotuloDaSecao}>Preferências visuais</Text>

          <View style={styles.cartao}>
            <Text style={styles.paragrafo}>
              O aplicativo usa três cores para sinalizar situações:{" "}
              <Text style={styles.paragrafoForte}>verde</Text> para confirmações,{" "}
              <Text style={styles.paragrafoForte}>amarelo</Text> para o que pede atenção e{" "}
              <Text style={styles.paragrafoForte}>vermelho</Text> para o que é urgente.
            </Text>
            <Text style={styles.paragrafo}>
              Se você tem dificuldade em distinguir essas cores, como acontece no daltonismo
              (deuteranopia, protanopia ou tritanopia), escolha abaixo o melhor conjunto de cores
              para você.
            </Text>
            {/* A ressalva sobre o azul: ela responde a pergunta óbvia de quem olha a tela e vê
                azul em toda parte sem que ele apareça nas opções. */}
            <Text style={styles.paragrafo}>
              O azul do aplicativo nunca é usado sozinho para indicar uma situação, por isso não está
              entre as opções de alteração.
            </Text>

            <SeletorDeCoresDeEstado />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
