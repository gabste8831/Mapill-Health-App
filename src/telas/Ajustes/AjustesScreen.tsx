import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { Card, FotoLocal } from "@/ui";
import { styles } from "./AjustesScreen.styles";

export type AjustesScreenProps = {
  /** Nome do paciente, do registro salvo. Vazio enquanto a ficha não foi preenchida. */
  patientName: string;
  photoUri: string | null;
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  onBack: () => void;
  onEditProfile: () => void;
  /** Abre a tela de conta e dados, onde moram vincular, termos e apagamento (E4). */
  onOpenAccount: () => void;
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
  onBack,
  onEditProfile,
  onOpenAccount,
}: AjustesScreenProps) {
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

        {/* Uma linha só, e não três seções: conta, consentimento e apagamento saíram para tela
            própria (E4). São as decisões das quais não se volta, e tê-las no caminho de quem só
            queria editar a ficha convidava ao toque acidental. */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA E DADOS</Text>
          <Card>
            {/* Ícone de conta nos dois casos, e não o logo do Google quando vinculado: a linha leva
                a conta, dados e termos, e o logo prometia que ela era sobre login. O e-mail, quando
                existe, continua sendo o melhor subtítulo possível — dizer *qual* conta está
                vinculada é mais útil que descrever a tela que vem depois. */}
            <Linha
              icon={
                <Ionicons name="person-circle-outline" size={22} color={colors.onSurfaceVariant} />
              }
              label="Conta e dados"
              hint={accountEmail ?? "Gerencie aqui sua conta, dados e sincronizações"}
              onPress={onOpenAccount}
            />
          </Card>
          <Text style={styles.sectionFooter}>
            Seus dados ficam neste aparelho, com ou sem conta vinculada.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
