import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { styles } from "./EmConstrucaoScreen.styles";

type EmConstrucaoScreenProps = {
  title: string;
  /** Explica pro paciente/dev o que falta e em qual bloco do plano isso é implementado. */
  description: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
};

/** Ocupa as rotas que já existem mas ainda não têm conteúdo: Calendário, Remédios, Ajustes, Scanner, Compromisso. */
export function EmConstrucaoScreen({ title, description, icon = "construct-outline" }: EmConstrucaoScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Ionicons name={icon} size={40} color={colors.onSurfaceVariant} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}
