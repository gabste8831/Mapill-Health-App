import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/ui";
import { colors } from "@/shared/theme";
import { styles } from "./EscolhaDeCadastroScreen.styles";

export type OpcaoDeCadastro = {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

type EscolhaDeCadastroScreenProps = {
  title: string;
  options: OpcaoDeCadastro[];
};

/**
 * Tela de decisão binária do fluxo de cadastro ("O que deseja cadastrar?", "Como deseja
 * cadastrar?") — ver ordem fechada em screens-and-flows.md §2. Reutilizada pelas duas etapas
 * porque o layout (título + lista de opções) é idêntico, só as opções mudam.
 */
export function EscolhaDeCadastroScreen({ title, options }: EscolhaDeCadastroScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
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
