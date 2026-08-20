import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CURRENT_TERMS_VERSION,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_USE_SECTIONS,
} from "@/telas/Consentimento/texto-legal";
import { Card, Header, LegalAccordion } from "@/ui";
import { styles } from "./TermosScreen.styles";

export type TermosScreenProps = {
  /** Versão que o paciente aceitou. `null` enquanto nenhum consentimento foi registrado. */
  acceptedVersion: string | null;
  /** ISO 8601 do aceite, para exibir a data. */
  acceptedAt: string | null;
  onBack: () => void;
};

/** `2026-08-20T12:00:00.000Z` → `20/08/2026`. */
function toDisplayDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

/**
 * Consulta dos termos aceitos. Não há revogação aqui: o consentimento é a base legal de tudo
 * que o app faz com dado de saúde, então revogar equivale a parar de usar e apagar os dados —
 * uma ação de exclusão, e não um botão perdido numa tela de leitura.
 */
export function TermosScreen({ acceptedVersion, acceptedAt, onBack }: TermosScreenProps) {
  const isUpToDate = acceptedVersion === CURRENT_TERMS_VERSION;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Termos e privacidade" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.sectionTitle}>SEU CONSENTIMENTO</Text>
          {acceptedVersion === null ? (
            <Text style={styles.statusText}>Nenhum consentimento registrado neste aparelho.</Text>
          ) : (
            <View style={styles.statusList}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Aceito em</Text>
                <Text style={styles.statusValue}>
                  {acceptedAt ? toDisplayDate(acceptedAt) : "—"}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Versão aceita</Text>
                <Text style={styles.statusValue}>{acceptedVersion}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Versão atual</Text>
                <Text style={styles.statusValue}>{CURRENT_TERMS_VERSION}</Text>
              </View>
            </View>
          )}
          <Text style={styles.statusHint}>
            {isUpToDate
              ? "Você está na versão mais recente. Se os termos mudarem, o Mapill pede um novo aceite antes de continuar."
              : "Os termos mudaram desde o seu aceite. O Mapill vai pedir um novo consentimento na próxima abertura."}
          </Text>
        </Card>

        <LegalAccordion title="Termos de Uso" sections={TERMS_OF_USE_SECTIONS} />
        <LegalAccordion title="Política de Privacidade" sections={PRIVACY_POLICY_SECTIONS} />
      </ScrollView>
    </SafeAreaView>
  );
}
