import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { Card, FotoLocal, GoogleLogo } from "@/ui";
import { styles } from "./AjustesScreen.styles";

export type AjustesScreenProps = {
  /** Nome do paciente, do registro salvo. Vazio enquanto a ficha não foi preenchida. */
  patientName: string;
  photoUri: string | null;
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  /** `false` num build que saiu sem as credenciais do Supabase — ver `LoginScreen`. */
  googleDisponivel: boolean;
  onBack: () => void;
  onEditProfile: () => void;
  onOpenTerms: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  /** Apaga medicamentos, tratamentos, histórico e estoque. Ficha e consentimento ficam. */
  onEraseHealthData: () => void;
  /** Apaga tudo, desvincula a conta e devolve o app à primeira execução. */
  onEraseEverything: () => void;
};

type LinhaProps = {
  label: string;
  hint?: string;
  /** Nó em vez de nome de ícone: a linha do Google usa a marca real, não um ícone genérico. */
  icon: ReactNode;
  /** Pinta o rótulo na cor de erro. Para o que apaga dado, não para o que só navega. */
  destrutiva?: boolean;
  onPress: () => void;
};

function Linha({ label, hint, icon, destrutiva = false, onPress }: LinhaProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, destrutiva && styles.rowLabelDestrutiva]}>{label}</Text>
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
  googleDisponivel,
  onBack,
  onEditProfile,
  onOpenTerms,
  onSignIn,
  onSignOut,
  onEraseHealthData,
  onEraseEverything,
}: AjustesScreenProps) {
  const isSignedIn = accountEmail !== null;
  const hasProfile = patientName.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* O bloco de identidade é o próprio atalho pra ficha: numa tela sobre o paciente, o
            retrato dele é o ponto de entrada mais óbvio que existe. */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {/* Ajustes é aba, mas também é destino do atalho de conta da Home — quem chegou por
                lá espera poder voltar de onde veio, e não caçar a aba anterior na barra. */}
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Voltar">
              <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
            </Pressable>
            <Text style={styles.heroTitle}>Ajustes</Text>
          </View>

          <Pressable style={styles.identity} onPress={onEditProfile} accessibilityRole="button">
            <View style={styles.avatar}>
              {photoUri ? (
                <FotoLocal uri={photoUri} style={styles.avatarImage} />
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
                icon={<Ionicons name="link-outline" size={22} color={colors.onSurfaceVariant} />}
                label="Desvincular esta conta"
                hint={accountEmail ?? undefined}
                onPress={onSignOut}
              />
            ) : (
              <Linha
                icon={<GoogleLogo size={22} />}
                label="Vincular uma conta do Google"
                // O texto anterior dizia "habilita o backup dos seus dados", e não habilitava:
                // não existe sincronização ainda. Prometer backup num app de saúde faz alguém
                // trocar de celular confiando e perder o histórico.
                hint={
                  googleDisponivel
                    ? "Nada do que já está salvo é perdido. A cópia na nuvem ainda não está disponível."
                    : "Indisponível nesta versão do app, que saiu sem a configuração do login."
                }
                onPress={onSignIn}
              />
            )}
          </Card>
          <Text style={styles.sectionFooter}>
            {isSignedIn
              ? "Seus dados ficam neste aparelho. Desvincular não apaga nada."
              : "Seus dados ficam neste aparelho, com ou sem conta vinculada."}
          </Text>
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

        {/* Separado da conta de propósito: apagar dado e desvincular conta são coisas diferentes,
            e juntá-las na mesma seção sugeriria que uma implica a outra. */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEUS DADOS</Text>
          <Card>
            <Linha
              icon={<Ionicons name="trash-outline" size={22} color={colors.error} />}
              label="Apagar meus dados de saúde"
              hint="Medicamentos, tratamentos, horários, histórico e estoque. Sua ficha continua."
              destrutiva
              onPress={onEraseHealthData}
            />
            <Linha
              icon={<Ionicons name="nuclear-outline" size={22} color={colors.error} />}
              label="Apagar tudo e recomeçar"
              hint="Inclui a ficha e o consentimento. O app volta como recém-instalado."
              destrutiva
              onPress={onEraseEverything}
            />
          </Card>
          <Text style={styles.sectionFooter}>
            O apagamento é definitivo e acontece neste aparelho. Não há como desfazer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
