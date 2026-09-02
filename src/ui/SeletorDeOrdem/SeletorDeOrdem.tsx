import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text } from "react-native";

import { colors, estadoDePressao } from "@/shared/theme";
import { styles } from "./SeletorDeOrdem.styles";

export type OpcaoDeOrdem<T extends string> = {
  value: T;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type SeletorDeOrdemProps<T extends string> = {
  value: T;
  options: OpcaoDeOrdem<T>[];
  onChange: (value: T) => void;
};

/**
 * Fileira de fichas para escolher como a lista é ordenada.
 *
 * Sempre há uma marcada — ordem é estado, não filtro, e "nenhuma ordem" não existe: a lista sai
 * de algum jeito de qualquer forma. Deixar isso implícito é o que fazia a pessoa não entender por
 * que o remédio que ela acabou de cadastrar aparecia no meio.
 *
 * Rola na horizontal porque o número de opções muda por tela, e quebrar em duas linhas custaria
 * altura numa área que já compete com a lista.
 */
export function SeletorDeOrdem<T extends string>({
  value,
  options,
  onChange,
}: SeletorDeOrdemProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.fileira}>
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
            accessibilityLabel={`Ordenar por ${option.label}`}>
            <Ionicons
              name={option.icon}
              size={16}
              color={selecionada ? colors.onPrimary : colors.onSurfaceVariant}
            />
            <Text style={[styles.rotulo, selecionada && styles.rotuloSelecionado]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
