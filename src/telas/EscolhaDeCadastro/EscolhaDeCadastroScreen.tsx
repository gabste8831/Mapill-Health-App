import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, Header } from "@/ui";
import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./EscolhaDeCadastroScreen.styles";

export type OpcaoDeCadastro = {
  label: string;
  /** O que esse caminho faz, em uma linha. É o que evita a escolha por adivinhação. */
  description: string;
  /** Nó em vez de nome: cada família tem seu peso de traço, e a escolha e da rota. */
  icon: ReactNode;
  onPress: () => void;
};

type EscolhaDeCadastroScreenProps = {
  /** Nome da seção, no header. */
  headerTitle: string;
  /** Parágrafo curto explicando a escolha antes das opções. */
  intro: string;
  options: OpcaoDeCadastro[];
  onBack?: () => void;
};

/**
 * Serve as duas etapas do fluxo de cadastro (o que cadastrar, e depois como). Cada opção se
 * explica: o título diz a ação e a linha abaixo diz o que ela abrange, para a pessoa não
 * precisar entrar pra descobrir se era ali.
 */
export function EscolhaDeCadastroScreen({
  headerTitle,
  intro,
  options,
  onBack,
}: EscolhaDeCadastroScreenProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title={headerTitle} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{intro}</Text>

        <View style={styles.options}>
          {options.map((option) => (
            <Pressable key={option.label} onPress={option.onPress} accessibilityRole="button">
              <Card>
                <View style={styles.optionRow}>
                  <View style={styles.optionIcon}>{option.icon}</View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
