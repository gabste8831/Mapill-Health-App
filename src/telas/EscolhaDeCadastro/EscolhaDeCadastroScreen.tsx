import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Header } from "@/ui";
import { colors } from "@/shared/theme";
import { styles } from "./EscolhaDeCadastroScreen.styles";

export type OpcaoDeCadastro = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

type EscolhaDeCadastroScreenProps = {
  /** Nome da seção, no header. A pergunta em si fica no `title`, dentro do conteúdo. */
  headerTitle: string;
  title: string;
  options: OpcaoDeCadastro[];
  onBack?: () => void;
};

/**
 * Serve as duas perguntas do fluxo de cadastro ("O que deseja cadastrar?" e "Como deseja
 * cadastrar?") — o layout é o mesmo, só as opções mudam.
 */
export function EscolhaDeCadastroScreen({ headerTitle, title, options, onBack }: EscolhaDeCadastroScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={headerTitle} onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.options}>
          {options.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              label={option.label}
              icon={<Ionicons name={option.icon} size={20} color={colors.onSurface} />}
              onPress={option.onPress}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
