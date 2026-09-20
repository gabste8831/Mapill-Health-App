import type { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./SeletorDeOrdem.styles";

export type OpcaoDeOrdem<T extends string> = {
  value: T;
  label: string;
  /**
   * Mantido no tipo, mas nao desenhado: nenhum dos rotulos tem simbolo que signifique algo sozinho,
   * e a largura que o icone custava era o que forcava a fileira a rolar.
   */
  icon?: keyof typeof Ionicons.glyphMap;
};

export type SeletorDeOrdemProps<T extends string> = {
  value: T;
  options: OpcaoDeOrdem<T>[];
  onChange: (value: T) => void;
  /**
   * Como o leitor de tela nomeia cada ficha. O padrão fala de ordenação porque foi para isso que a
   * fileira nasceu; quem a usa como filtro ou período passa o verbo certo, senão o TalkBack anuncia
   * "Ordenar por 30 dias" numa escolha que não ordena nada.
   */
  descreverOpcao?: (label: string) => string;
};

/**
 * Fileira de fichas para escolher entre poucas opcoes que governam o que a tela mostra.
 *
 * Nao e o `OptionGroup`: aquele e para escolha que se grava, onde a opcao e um cartao com apoio e
 * icone. Este e para escolha que so muda a vista e se desfaz no toque seguinte.
 *
 * Sempre ha uma marcada, porque ordem e estado e "nenhuma ordem" nao existe. Todas cabem sem
 * rolagem: a fileira rolava na horizontal e escondia opcoes atras de um gesto que nada anunciava.
 */
export function SeletorDeOrdem<T extends string>({
  value,
  options,
  onChange,
  descreverOpcao = (label) => `Ordenar por ${label}`,
}: SeletorDeOrdemProps<T>) {
  const styles = useEstilos(criarEstilos);

  return (
    <View style={styles.fileira}>
      {options.map((option) => {
        const selecionada = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={estadoDePressao([styles.ficha, selecionada && styles.fichaSelecionada], {
              escala: true,
            })}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={descreverOpcao(option.label)}>
            <Text
              style={[styles.rotulo, selecionada && styles.rotuloSelecionado]}
              numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
