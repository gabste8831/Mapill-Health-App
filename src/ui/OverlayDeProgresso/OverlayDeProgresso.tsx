import { ActivityIndicator, Modal, Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
// Os mesmos estilos do `SuccessOverlay`: são a mesma tela cheia azul, no mesmo momento do fluxo -
// o fim de uma operação longa. O que muda é que uma comemora e a outra pede paciência.
import { criarEstilos } from "@/ui/SuccessOverlay/SuccessOverlay.styles";

export type OverlayDeProgressoProps = {
  visivel: boolean;
  titulo: string;
  descricao: string;
};

/**
 * Tela cheia enquanto algo demorado acontece, sem prometer quando termina.
 *
 * Nao e o `SuccessOverlay`, que some sozinho porque comemora algo ja acabado: aqui o tempo e da
 * rede, e um overlay que sai por conta propria devolveria a pessoa a uma tela incompleta.
 *
 * Existe porque o login restaura os dados antes de decidir para onde ir, e sem cobrir esse
 * intervalo a tela de login reaparece por alguns segundos, o que le como falha.
 *
 * Sem barra nem porcentagem: nao ha como saber quantos registros virao antes de pedi-los, e uma
 * barra que anda ate 90% e para e pior que nenhuma.
 */
export function OverlayDeProgresso({ visivel, titulo, descricao }: OverlayDeProgressoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Modal visible={visivel} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        {/* No lugar do círculo com o visto: mesmo tamanho e posição, para as duas telas serem a
            mesma coisa em momentos diferentes. */}
        <ActivityIndicator size="large" color={cores.onPrimary} />

        <View style={styles.texts}>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.description}>{descricao}</Text>
        </View>
      </View>
    </Modal>
  );
}
