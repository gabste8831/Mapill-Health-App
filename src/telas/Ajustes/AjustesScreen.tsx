import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { Card, GoogleLogo } from "@/ui";
import { styles } from "./AjustesScreen.styles";

export type AjustesScreenProps = {
  /** Nome do paciente, do registro salvo. Vazio enquanto a ficha não foi preenchida. */
  patientName: string;
  photoUri: string | null;
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  onEditProfile: () => void;
  onOpenTerms: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

type LinhaProps = {
  label: string;
  hint?: string;
  /** Nó em vez de nome de ícone: a linha do Google usa a marca real, não um ícone genérico. */
  icon: ReactNode;
  onPress: () => void;
};

function Linha({ label, hint, icon, onPress }: LinhaProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
}

/** Iniciais como retrato de reserva enquanto não há foto — evita o vazio de um avatar cinza. */
function Iniciais({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length === 0 ? "?" : (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
  return <Text style={styles.avatarInitials}>{initials}</Text>;
}

export function AjustesScreen({
  patientName,
  photoUri,
  accountEmail,
  onEditProfile,
  onOpenTerms,
  onSignIn,
  onSignOut,
}: AjustesScreenProps) {
  const isSignedIn = accountEmail !== null;
  const hasProfile = patientName.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* O bloco de identidade é o próprio atalho pra ficha: numa tela sobre o paciente, o
            retrato dele é o ponto de entrada mais óbvio que existe. */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Ajustes</Text>

          <Pressable style={styles.identity} onPress={onEditProfile} accessibilityRole="button">
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Iniciais name={patientName} />
              )}
            </View>

            <View style={styles.identityText}>
              <Text style={styles.identityGreeting}>Sua ficha de saúde</Text>
              <Text style={styles.identityName} numberOfLines={1}>
                {hasProfile ? patientName : "Ainda não preenchida"}
              </Text>
            </View>

            <View style={styles.identityEdit}>
              <Ionicons name="pencil" size={16} color={colors.onPrimary} />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <Card>
            {isSignedIn ? (
              <Linha
                icon={<Ionicons name="log-out-outline" size={22} color={colors.onSurfaceVariant} />}
                label="Sair da conta"
                hint={accountEmail}
                onPress={onSignOut}
              />
            ) : (
              <Linha
                icon={<GoogleLogo size={22} />}
                label="Entrar com o Google"
                hint="Habilita o backup dos seus dados. Nada do que já está salvo é perdido."
                onPress={onSignIn}
              />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACIDADE</Text>
          <Card>
            <Linha
              icon={<Ionicons name="document-text-outline" size={22} color={colors.onSurfaceVariant} />}
              label="Termos e privacidade"
              hint="Ler os termos aceitos e ver a data do seu aceite"
              onPress={onOpenTerms}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
