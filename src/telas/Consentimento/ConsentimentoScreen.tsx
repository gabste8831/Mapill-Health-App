import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScrollToExpanded } from "@/hooks/use-scroll-to-expanded";
import { Accordion, Button, Checkbox, Header, LegalAccordion } from "@/ui";
import {
  APP_PURPOSE_TEXT,
  DATA_PRACTICE_HIGHLIGHTS,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_USE_SECTIONS,
} from "./texto-legal";
import { styles } from "./ConsentimentoScreen.styles";

type ConsentimentoScreenProps = {
  /** Só chamado depois dos dois checkboxes marcados — registra o consentimento e libera o app. */
  onAccept: () => void;
  /**
   * Volta pra tela de login. Omitir esconde o botão — a tela não decide sozinha se há
   * retorno possível, quem sabe isso é o gate (`useFirstRunGate.canGoBack`).
   */
  onBack?: () => void;
};

// Bloqueante de propósito: sem "pular" nem "decidir depois". Dado de saúde é sensível por
// definição legal e atravessa toda funcionalidade central — não existe modo sem consentimento.
export function ConsentimentoScreen({ onAccept, onBack }: ConsentimentoScreenProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasConsentedToDataProcessing, setHasConsentedToDataProcessing] = useState(false);

  const canContinue = hasReadTerms && hasConsentedToDataProcessing;

  const { scrollViewRef, registerItem, scrollToItem } = useScrollToExpanded();

  function handleContinue() {
    if (!canContinue) return;
    onAccept();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Antes de começar" onBack={onBack} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.purposeText}>{APP_PURPOSE_TEXT}</Text>

        {/* Resumo das práticas de dados: leitura breve, destacada do texto legal completo. */}
        <View style={styles.highlightList}>
          {DATA_PRACTICE_HIGHLIGHTS.map((highlight) => (
            <View key={highlight.title} onLayout={registerItem(highlight.title)}>
              <Accordion
                title={highlight.title}
                tone="azul"
                toggleLabel
                onToggle={scrollToItem(highlight.title)}>
                <Text style={styles.highlightDescription}>{highlight.description}</Text>
              </Accordion>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.legalSectionsGroup}>
          <View onLayout={registerItem("Termos de Uso")}>
            <LegalAccordion
              title="Termos de Uso"
              sections={TERMS_OF_USE_SECTIONS}
              onToggle={scrollToItem("Termos de Uso")}
            />
          </View>
          <View onLayout={registerItem("Política de Privacidade")}>
            <LegalAccordion
              title="Política de Privacidade"
              sections={PRIVACY_POLICY_SECTIONS}
              onToggle={scrollToItem("Política de Privacidade")}
            />
          </View>
        </View>

        <View style={styles.consentGroup}>
          <Checkbox
            checked={hasReadTerms}
            onChange={setHasReadTerms}
            accessibilityLabel="Li e concordo com os Termos de Uso e a Política de Privacidade"
            label="Li e concordo com os Termos de Uso e a Política de Privacidade."
          />
          <Checkbox
            checked={hasConsentedToDataProcessing}
            onChange={setHasConsentedToDataProcessing}
            accessibilityLabel="Autorizo o tratamento dos meus dados de saúde para as finalidades descritas"
            label="Autorizo o tratamento dos meus dados de saúde para as finalidades descritas nesta tela, conforme a LGPD."
          />
        </View>

        <Button label="Concordo e continuar" onPress={handleContinue} disabled={!canContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}
