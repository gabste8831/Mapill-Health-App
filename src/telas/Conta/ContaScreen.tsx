import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { exportarDados } from "@/data/repositories/exportar-dados";
import { useSync } from "@/hooks/use-sync";
import { colors } from "@/shared/theme";
import { Card, GoogleLogo, Header, IndicadorDeSync } from "@/ui";
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
  const sync = useSync();
  const [exportando, setExportando] = useState(false);

  /**
   * Gera o arquivo e abre a folha de compartilhamento do sistema.
   *
   * **Compartilhar, e não "salvar em Downloads".** O app não escolhe o destino: quem escolhe é a
   * pessoa, no menu do Android — Drive, e-mail para si mesma, WhatsApp, arquivos locais. Escolher
   * por ela criaria um arquivo com dado de saúde num lugar que ela talvez não esperasse.
   */
  async function exportar() {
    if (exportando) return;
    setExportando(true);
    try {
      const resultado = await exportarDados();

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Arquivo gerado",
          `Seus dados foram salvos em ${resultado.nome}, mas este aparelho não oferece a tela de compartilhamento.`,
        );
        return;
      }

      await Sharing.shareAsync(resultado.uri, {
        mimeType: "application/json",
        dialogTitle: "Salvar meus dados do Mapill",
      });
    } catch (cause) {
      Alert.alert(
        "Não foi possível exportar",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    } finally {
      setExportando(false);
    }
  }

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
                    ? "Nada do que já está salvo é perdido, e seus dados passam a ter cópia na nuvem."
                    : "Indisponível nesta versão do app, que saiu sem a configuração do login."
                }
                onPress={onSignIn}
              />
            )}
          </Card>

          {/* O estado da cópia, e não uma promessa sobre ela. Aparece só com conta vinculada:
              sem conta não há nuvem, e um indicador de sincronização ali seria falar de algo que
              não existe. */}
          {isSignedIn ? (
            <IndicadorDeSync
              estado={sync.estado}
              sincronizando={sync.sincronizando}
              onSincronizar={() => void sync.sincronizarAgora()}
            />
          ) : null}

          <Text style={styles.sectionFooter}>
            {isSignedIn
              ? "Seus dados ficam neste aparelho e têm cópia na sua conta. Desvincular não apaga nada."
              : "Seus dados ficam neste aparelho. Vincular uma conta acrescenta a cópia na nuvem."}
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
            {/* Exportar vem **antes** de apagar, e não é ordem arbitrária: é a última chance de
                levar os dados embora, e quem chega nesta seção decidido a apagar tudo precisa
                passar o olho por ela primeiro. */}
            <Linha
              icon={
                <Ionicons name="download-outline" size={22} color={colors.onSurfaceVariant} />
              }
              label={exportando ? "Preparando o arquivo…" : "Baixar uma cópia dos meus dados"}
              hint="Um arquivo com tudo que o app guarda sobre você, para salvar onde quiser."
              onPress={() => void exportar()}
            />
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
          {/* O texto mudou junto com o D1: dizer que o apagamento acontece "neste aparelho" deixou
              de ser a história completa no instante em que passou a existir uma cópia na nuvem. */}
          <Text style={styles.sectionFooter}>
            {isSignedIn
              ? "O apagamento é definitivo, e alcança também a cópia na sua conta. Não há como desfazer."
              : "O apagamento é definitivo e acontece neste aparelho. Não há como desfazer."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
