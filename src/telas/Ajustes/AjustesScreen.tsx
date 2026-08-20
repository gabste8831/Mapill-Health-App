import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { Card, Header } from "@/ui";
import { styles } from "./AjustesScreen.styles";

export type AjustesScreenProps = {
  /** Nome do paciente, do registro salvo. Vazio enquanto a ficha não foi preenchida. */
  patientName: string;
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  onEditProfile: () => void;
  onOpenTerms: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

type OpcaoDeAjuste = {
  label: string;
  hint?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  isDestructive?: boolean;
};

function LinhaDeAjuste({ label, hint, icon, onPress, isDestructive }: OpcaoDeAjuste) {
  const tint = isDestructive ? colors.error : colors.onSurface;

  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={tint} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, isDestructive && styles.rowLabelDestructive]}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
}

export function AjustesScreen({
  patientName,
  accountEmail,
  onEditProfile,
  onOpenTerms,
  onSignIn,
  onSignOut,
}: AjustesScreenProps) {
  const isSignedIn = accountEmail !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Ajustes" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.sectionTitle}>MINHA FICHA</Text>
          <LinhaDeAjuste
            icon="person-outline"
            label={patientName.length > 0 ? patientName : "Ficha de saúde"}
            hint={
              patientName.length > 0
                ? "Ver e alterar tipo sanguíneo, alergias e contatos de emergência"
                : "Ainda não preenchida"
            }
            onPress={onEditProfile}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>CONTA</Text>
          {isSignedIn ? (
            <LinhaDeAjuste
              icon="log-out-outline"
              label="Sair da conta"
              hint={accountEmail}
              onPress={onSignOut}
            />
          ) : (
            <LinhaDeAjuste
              icon="logo-google"
              label="Entrar com o Google"
              hint="Habilita backup dos seus dados. Nada do que já está salvo é perdido."
              onPress={onSignIn}
            />
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>PRIVACIDADE</Text>
          <LinhaDeAjuste
            icon="document-text-outline"
            label="Termos e privacidade"
            hint="Ler os termos aceitos e ver a data do seu aceite"
            onPress={onOpenTerms}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
