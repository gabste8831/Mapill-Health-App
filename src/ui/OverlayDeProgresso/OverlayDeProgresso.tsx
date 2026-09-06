import { ActivityIndicator, Modal, Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
// Os mesmos estilos do `SuccessOverlay`: são a mesma tela cheia azul, no mesmo momento do fluxo —
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
 * ## Por que não o `SuccessOverlay`
 *
 * Aquele some sozinho depois de alguns segundos, porque comemora algo que **já acabou**. Aqui o
 * tempo é da rede: pode ser meio segundo com 4G bom, pode ser dez com sinal ruim. Um overlay que
 * sai por conta própria devolveria a pessoa a uma tela ainda incompleta.
 *
 * ## Por que existe
 *
 * O login restaura os dados antes de decidir para onde ir. Sem cobrir esse intervalo, quem entra
 * com o Google vê a tela de login **voltar** por alguns segundos antes de a Home aparecer — e uma
 * tela de login que reaparece depois de você ter entrado lê como falha, não como espera.
 *
 * Sem barra de progresso e sem porcentagem: não há como saber quantos registros virão antes de
 * pedi-los, e uma barra que anda até 90% e para é pior que nenhuma.
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
