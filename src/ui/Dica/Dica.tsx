import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./Dica.styles";

export type DicaProps = {
  children: string;
};

/**
 * Ajuda de preenchimento — onde ler a unidade no frasco, o que a forma escolhida implica.
 *
 * Existe como componente próprio porque, em texto corrido cinza, a dica se misturava ao rótulo do
 * campo e à mensagem de erro: três coisas de peso diferente com a mesma aparência. O ícone e o
 * fundo dizem "isto é apoio, não é cobrança" antes de a frase ser lida — que é a diferença entre
 * a pessoa procurar a caixa do remédio e ela achar que errou alguma coisa.
 */
export function Dica({ children }: DicaProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      {/* O `?` na tinta âmbar: agora que a cor é legível (4.8:1), ela carrega o sinal que a faixa
          lateral carregava antes — ver o cabeçalho de `estadoVisual` em shared/theme/cores.ts. */}
      <Ionicons name="help-circle" size={20} color={cores.warning} style={styles.icone} />
      <Text style={styles.texto}>{children}</Text>
    </View>
  );
}
