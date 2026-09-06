import type { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./SeletorDeOrdem.styles";

export type OpcaoDeOrdem<T extends string> = {
  value: T;
  label: string;
  /**
   * Mantido no tipo, mas **não** desenhado.
   *
   * O ícone saiu das fichas: nenhum dos três ("A–Z", "Mais recentes", "Acabando") tem símbolo que
   * signifique algo sem o rótulo ao lado, então ele custava largura sem acrescentar leitura — e era
   * a largura que forçava a fileira a rolar. O campo fica porque as telas já o declaram e ele
   * descreve a intenção de cada opção para quem for lê-las no código.
   */
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
 * ## Todas as opções à vista, sem rolagem
 *
 * A fileira rolava na horizontal, e isso escondia opções atrás de um gesto que nada anunciava:
 * quem não arrastasse não sabia que "Acabando" existia. Um seletor com opção invisível não é um
 * seletor, é uma lista de uma opção só com um segredo.
 *
 * Cabem todas porque duas coisas saíram: o **ícone** (nenhum dos rótulos tem símbolo que signifique
 * algo sozinho) e um degrau de fonte. As fichas dividem a largura em partes iguais — `flex: 1` em
 * cada —, então três ou quatro opções acomodam do mesmo jeito, e a fileira fica alinhada em vez de
 * ter larguras ditadas pelo tamanho de cada palavra.
 */
export function SeletorDeOrdem<T extends string>({
  value,
  options,
  onChange,
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
            accessibilityLabel={`Ordenar por ${option.label}`}>
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
