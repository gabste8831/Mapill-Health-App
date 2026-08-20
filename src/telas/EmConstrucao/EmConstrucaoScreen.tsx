import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/ui";
import { colors } from "@/shared/theme";
import { styles } from "./EmConstrucaoScreen.styles";

type EmConstrucaoScreenProps = {
  title: string;
  description: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Só as rotas empilhadas passam — nas abas não há pra onde voltar. */
  onBack?: () => void;
};

/** Ocupa as rotas que já existem mas ainda não têm conteúdo: Calendário, Remédios, Ajustes, Scanner, Compromisso. */
export function EmConstrucaoScreen({ title, description, icon = "construct-outline", onBack }: EmConstrucaoScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={title} onBack={onBack} />
      <View style={styles.content}>
        <Ionicons name={icon} size={40} color={colors.onSurfaceVariant} />
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}
