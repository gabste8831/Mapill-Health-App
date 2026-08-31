import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { Button } from "../Button/Button";
import { styles } from "./EstadoDeErro.styles";

export type EstadoDeErroProps = {
  /** A mensagem que veio do erro. Vai como está — quem a escreveu sabe o que aconteceu. */
  mensagem: string;
  /** Tentar de novo. Sem isto o componente vira só um texto vermelho, que é o que ele substitui. */
  onTentarDeNovo: () => void;
};

/**
 * Erro numa tela de leitura, **com saída**.
 *
 * Existe porque seis telas mostravam a mensagem e paravam ali. Quem caía num erro de leitura do
 * banco — o que acontece, por exemplo, se a tela abre no meio da importação do catálogo — ficava
 * olhando um texto vermelho sem nada a fazer além de sair e voltar, torcendo. Uma mensagem de erro
 * sem ação é uma parede.
 *
 * O texto acima do botão diz o que **não** aconteceu, e isso importa mais do que parece: num app
 * de saúde, "não consegui carregar" pode ser lido como "seus dados sumiram". Falha de leitura não
 * apaga nada, e a frase precisa dizer isso antes que a pessoa conclua o contrário.
 */
export function EstadoDeErro({ mensagem, onTentarDeNovo }: EstadoDeErroProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
      <Text style={styles.titulo}>Não foi possível carregar</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>
      <Text style={styles.tranquilizador}>
        Seus dados continuam salvos no aparelho — isto foi só uma falha ao exibi-los.
      </Text>
      <Button label="Tentar de novo" onPress={onTentarDeNovo} style={styles.acao} />
    </View>
  );
}
