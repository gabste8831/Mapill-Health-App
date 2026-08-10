import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { styles } from "./LoginScreen.styles";

type LoginScreenProps = {
  /**
   * Chamado após login com Google bem-sucedido. Hoje é um stub — a autenticação real
   * (Supabase Auth + Google OAuth) ainda não está implementada, ver `sync-and-offline.md`.
   */
  onAuthenticated: () => void;
  /**
   * Chamado quando o paciente opta por não fazer login. Semanticamente diferente de
   * `onAuthenticated` mesmo que hoje leve ao mesmo lugar: sem login não há backup/sync,
   * só uso local (ver decisão de login/backup em screens-and-flows.md).
   */
  onContinueWithoutLogin: () => void;
};

// Só existe um único caminho de conta (Google), então não faz sentido pedir e-mail/senha
// próprios do app — quem não quer login/backup usa "Continuar sem login" direto.
export function LoginScreen({ onAuthenticated, onContinueWithoutLogin }: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          {/* TODO: trocar pelo asset da logo real (assets/images/logo.png) assim que disponível. */}
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>M</Text>
          </View>
          <Text style={styles.brandTitle}>Mapill</Text>
          <Text style={styles.brandSubtitle}>
            Sua rotina de medicação, sempre com você — mesmo sem internet.
          </Text>
        </View>

        <View style={styles.form}>
          <Pressable style={styles.googleButton} onPress={onAuthenticated} accessibilityRole="button">
            <Ionicons name="logo-google" size={20} color={colors.onSurface} />
            <Text style={styles.googleButtonText}>Continuar com Google</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCaption}>
            Login habilita backup e sincronização entre dispositivos. É opcional — você pode usar
            o Mapill offline, sem conta.
          </Text>
          <Pressable
            style={styles.continueWithoutLoginButton}
            onPress={onContinueWithoutLogin}
            accessibilityRole="button">
            <Text style={styles.continueWithoutLoginText}>Continuar sem login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
