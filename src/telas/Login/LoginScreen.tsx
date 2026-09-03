import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, GoogleLogo } from "@/ui";
import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./LoginScreen.styles";

type LoginScreenProps = {
  onAuthenticated: () => void;
  /**
   * Semanticamente diferente de `onAuthenticated` mesmo levando ao mesmo lugar: entrar prepara a
   * cópia na nuvem do D1, seguir sem conta não.
   */
  onContinueWithoutLogin: () => void;
  /**
   * `false` quando o build saiu sem as credenciais do Supabase. Descobrir isso só depois de tocar
   * é o pior dos dois mundos: a pessoa acha que errou alguma coisa, e tenta de novo.
   */
  googleDisponivel: boolean;
};

// Só existe um único caminho de conta (Google), então não faz sentido pedir e-mail/senha
// próprios do app — quem não quer login/backup usa "Continuar sem login" direto.
export function LoginScreen({
  onAuthenticated,
  onContinueWithoutLogin,
  googleDisponivel,
}: LoginScreenProps) {
  const styles = useEstilos(criarEstilos);

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
            disabled={!googleDisponivel}
            style={styles.actionButtonWidth}
          />
          {googleDisponivel ? null : (
            <Text style={styles.footerCaption}>
              Esta versão do app saiu sem a configuração do login com Google. Siga sem conta — nada
              do Mapill depende dela.
            </Text>
          )}
          <Button
            variant="outline"
            label="Continuar sem login"
            onPress={onContinueWithoutLogin}
            style={styles.actionButtonWidth}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          {/* Dizia que o login habilita backup e sincronização — e não habilita, porque não há
              sincronização ainda. Num app de medicação, prometer cópia inexistente faz alguém
              trocar de aparelho confiando e perder o histórico. O texto descreve o que existe. */}
          <Text style={styles.footerCaption}>
            Seus dados ficam neste aparelho, com ou sem conta. Entrar é opcional e acrescenta uma
            cópia na nuvem, para você não perder nada ao trocar de celular.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
