import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/shared/theme";
import { Card, GoogleLogo, Header } from "@/ui";
import { styles } from "./ContaScreen.styles";

export type ContaScreenProps = {
  /** E-mail da conta Google, ou `null` quando o app está sendo usado sem conta. */
  accountEmail: string | null;
  /** `false` num build que saiu sem as credenciais do Supabase — ver `LoginScreen`. */
  googleDisponivel: boolean;
  onBack: () => void;
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

/**
 * Tudo que é da **conta e do dado**, numa tela só: vincular, ler o que foi consentido e apagar.
 *
 * Estava espalhado em três seções dentro de Ajustes, no meio de coisas de uso diário. Juntar não é
 * arrumação: são as decisões das quais não se volta — apagar não tem desfazer, e o consentimento é
 * a base legal do app inteiro. Tirá-las do caminho de quem só queria editar a ficha reduz o toque
 * acidental, e dá a elas o espaço de explicar o que fazem.
 *
 * A separação interna entre CONTA e MEUS DADOS continua: apagar dado e desvincular conta são
 * coisas diferentes, e uma não implica a outra. O que mudou foi o endereço, não a distinção.
 */
export function ContaScreen({
  accountEmail,
  googleDisponivel,
  onBack,
  onOpenTerms,
  onSignIn,
  onSignOut,
  onEraseHealthData,
  onEraseEverything,
}: ContaScreenProps) {
  const isSignedIn = accountEmail !== null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Conta e dados" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              icon={
                <Ionicons name="document-text-outline" size={22} color={colors.onSurfaceVariant} />
              }
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
