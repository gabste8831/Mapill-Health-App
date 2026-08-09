import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { styles } from "./LoginScreen.styles";

type LoginScreenProps = {
  /**
   * Chamado após login bem-sucedido (email/senha ou Google). Hoje é um stub — a autenticação
   * real (Supabase Auth) ainda não está implementada, ver `sync-and-offline.md`.
   */
  onAuthenticated: () => void;
  /**
   * Chamado quando o paciente opta por não fazer login. Semanticamente diferente de
   * `onAuthenticated` mesmo que hoje leve ao mesmo lugar: sem login não há backup/sync,
   * só uso local (ver decisão de login/backup em screens-and-flows.md).
   */
  onContinueWithoutLogin: () => void;
};

export function LoginScreen({ onAuthenticated, onContinueWithoutLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>M</Text>
          </View>
          <Text style={styles.brandTitle}>Mapill</Text>
          <Text style={styles.brandSubtitle}>
            Sua rotina de medicação, sempre com você — mesmo sem internet.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>E-MAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.onSurfaceVariant}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SENHA</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Sua senha"
                placeholderTextColor={colors.onSurfaceVariant}
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setIsPasswordVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={onAuthenticated}
            accessibilityRole="button"
            disabled={email.trim().length === 0 || password.length === 0}>
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

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
