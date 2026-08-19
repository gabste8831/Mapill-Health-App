import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { styles } from "./PlaceholderScreen.styles";

type PlaceholderScreenProps = {
  title: string;
  /** Explica pro paciente/dev o que falta e em qual bloco do plano isso é implementado. */
  description: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
};

/**
 * Tela "em construção" — usada nas rotas já existentes (A1) cujo conteúdo ainda não foi
 * implementado (Calendário, Remédios, Ajustes, Scanner, Compromisso). Ver docs/PLANO-DE-DESENVOLVIMENTO.md.
 */
export function PlaceholderScreen({ title, description, icon = "construct-outline" }: PlaceholderScreenProps) {
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
