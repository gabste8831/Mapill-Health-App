import { Ionicons } from "@expo/vector-icons";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./EstadoVazio.styles";

export type EstadoVazioProps = {
  titulo: string;
  descricao: string;
  /** O ícone do assunto — "pílula" para medicações, "cubo" para estoque. */
  icone?: keyof typeof Ionicons.glyphMap;
  /** Ligar quando o bloco já está dentro de um cartão: evita cartão dentro de cartão. */
  semCartao?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * "Não há nada aqui ainda" — e o que fazer a respeito.
 *
 * Existe como componente porque três telas escreviam o próprio, com o mesmo texto centralizado e
 * o mesmo `maxWidth: 320` copiado, mas uma delas num cartão e as outras soltas no fundo. A mesma
 * situação com duas aparências é o tipo de diferença que ninguém nomeia e todo mundo sente.
 *
 * A descrição sempre diz **a saída**, nunca só o fato: "nenhum remédio" é um beco, "toque no +
 * para cadastrar o primeiro" é uma porta.
 */
export function EstadoVazio({ titulo, descricao, icone, semCartao = false, style }: EstadoVazioProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={[semCartao ? styles.containerSolto : styles.container, style]}>
      {icone ? (
        <View style={styles.disco}>
          <Ionicons name={icone} size={26} color={cores.primary} />
        </View>
      ) : null}
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descricao}>{descricao}</Text>
      </View>
    </View>
  );
}
