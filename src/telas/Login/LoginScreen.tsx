import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, GoogleLogo } from "@/ui";
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
export function LoginScreen({
  onAuthenticated,
  onContinueWithoutLogin,
}: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/brand/mark-transparent-a.png")}
            style={styles.brandLogo}
            contentFit="contain"
            accessibilityLabel="Mapill"
          />
          <Text style={styles.brandSubtitle}>
            Sua saúde organizada em um só lugar.
          </Text>
        </View>

        <View style={styles.form}>
          <Button
            variant="outline"
            label="Continuar com Google"
            icon={<GoogleLogo size={20} />}
            onPress={onAuthenticated}
            style={styles.actionButtonWidth}
          />
          <Button
            variant="outline"
            label="Continuar sem login"
            onPress={onContinueWithoutLogin}
            style={styles.actionButtonWidth}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerCaption}>
            Login habilita backup e sincronização entre dispositivos. É
            opcional, você pode usar o Mapill offline, sem conta.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
