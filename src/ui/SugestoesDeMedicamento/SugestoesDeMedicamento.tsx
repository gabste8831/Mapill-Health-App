import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { CatalogEntry } from "@/domain/ports/medication-catalog";
import { capitalizarNome } from "@/shared/rotulos-de-medicamento";
import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./SugestoesDeMedicamento.styles";

export type SugestoesDeMedicamentoProps = {
  sugestoes: CatalogEntry[];
  onEscolher: (entrada: CatalogEntry) => void;
};

/**
 * O que a CMED sabe sobre o que está sendo digitado.
 *
 * **Sugestão, e nunca autocompletar.** A lista aparece abaixo do campo e não mexe no que a pessoa
 * escreveu até ela tocar numa linha — escrever por cima do que alguém está digitando é a forma mais
 * rápida de fazer um cadastro clínico sair errado sem ninguém perceber.
 *
 * Some quando não há o que sugerir. Um bloco vazio dizendo "nenhum resultado" enquanto se digita as
 * primeiras letras seria uma mensagem de erro para quem ainda nem terminou de escrever — e o
 * cadastro manual é caminho legítimo, não plano B.
 */
export function SugestoesDeMedicamento({ sugestoes, onEscolher }: SugestoesDeMedicamentoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  if (sugestoes.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>É algum destes?</Text>

      {sugestoes.map((entrada) => (
        <Pressable
          key={`${entrada.name}-${entrada.strength}`}
          style={styles.item}
          onPress={() => onEscolher(entrada)}
          accessibilityRole="button"
          accessibilityLabel={`Usar ${capitalizarNome(entrada.name)} ${entrada.strength}`}>
          {/**
           * O nome vem da CMED **inteiro em maiúsculas**, e assim ele ocupa mais largura, quebra
           * em três linhas e se lê mais devagar — caixa alta apaga a silhueta da palavra, que é
           * por onde se reconhece um nome familiar de relance.
           *
           * `numberOfLines={1}`: a lista aparece sob o dedo de quem está digitando, e cada linha
           * a mais empurra a sugestão seguinte para fora da tela.
           *
           * Só nome e dosagem — sem o princípio ativo. Cada sugestão já é o suficiente pra
           * reconhecer o remédio, e a informação a mais alargava a decisão em vez de facilitá-la.
           */}
          <Text style={styles.nome} numberOfLines={1}>
            {capitalizarNome(entrada.name)}
            {entrada.strength.length > 0 ? (
              <Text style={styles.dosagem}> {entrada.strength}</Text>
            ) : null}
          </Text>

          <Ionicons name="arrow-forward" size={18} color={cores.corDeDestaque} />
        </Pressable>
      ))}
    </View>
  );
}
