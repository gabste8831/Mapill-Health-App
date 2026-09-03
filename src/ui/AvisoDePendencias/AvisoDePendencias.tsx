import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./AvisoDePendencias.styles";

export type AvisoDePendenciasProps = {
  /** Quantas alterações locais ainda não subiram. Zero esconde o aviso. */
  pendentes: number;
};

/**
 * "Ainda não subiu para a nuvem" — uma linha só, no topo da lista.
 *
 * **Um aviso para a tela, e não um selo por item.** Marcar cada card individualmente encheria a
 * lista de ícones para dizer algo que raramente muda a decisão de quem está lendo: a pessoa quer
 * ver seus remédios, não auditar o estado de sincronização de cada um. A pergunta real é "meus
 * dados estão salvos?", e ela se responde uma vez, no topo.
 *
 * **Não é erro, e o texto diz isso.** Ficar com alterações por enviar é o funcionamento normal de
 * um app offline-first — o dado está no aparelho, que é a fonte de verdade. Pintar isso de
 * vermelho ensinaria a pessoa a se preocupar com o que está certo, e a ignorar o indicador quando
 * ele tiver algo real a dizer.
 *
 * Some sozinho quando tudo sobe. Sem conta vinculada, `pendentes` é sempre zero: não há nuvem, e
 * portanto não há pendência.
 */
export function AvisoDePendencias({ pendentes }: AvisoDePendenciasProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  if (pendentes <= 0) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-upload-outline" size={16} color={cores.onSurfaceVariant} />
      <Text style={styles.texto}>
        {pendentes === 1
          ? "1 alteração ainda não subiu para a nuvem. Ela já está salva aqui."
          : `${pendentes} alterações ainda não subiram para a nuvem. Elas já estão salvas aqui.`}
      </Text>
    </View>
  );
}
