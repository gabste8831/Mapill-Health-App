import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Checkbox, IconButton } from "@/ui";
import { colors } from "@/shared/theme";
import {
  APP_PURPOSE_TEXT,
  DATA_PRACTICE_HIGHLIGHTS,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_USE_SECTIONS,
  type LegalSection,
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

type LegalAccordionProps = {
  title: string;
  sections: LegalSection[];
};

/** Bloco expansível com o texto completo de Termos de Uso ou Política de Privacidade. */
function LegalAccordion({ title, sections }: LegalAccordionProps) {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <View style={styles.accordionSection}>
      <Pressable
        style={styles.accordionHeader}
        onPress={() => setExpanded((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? "Recolher" : "Expandir"} ${title}`}>
        <Text style={styles.accordionHeaderText}>{title}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.onSurfaceVariant}
        />
      </Pressable>
      {isExpanded ? (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(150)}
          style={styles.accordionContent}>
          {sections.map((section) => (
            <View key={section.title}>
              <Text style={styles.accordionSectionTitle}>{section.title}</Text>
              {section.paragraphs.map((paragraph, index) => (
                <Text key={index} style={styles.accordionParagraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

// Tela bloqueante: sem opção de "pular" ou "decidir depois" de propósito — o Mapill lida com
// dado de saúde (sensível por definição legal) em toda funcionalidade central, então não existe
// um "modo sem consentimento" que faça sentido oferecer. Ver decisão de onboarding em
// screens-and-flows.md e a nota de rodapé em legal-content.ts sobre revisão jurídica.
export function ConsentimentoScreen({ onAccept, onBack }: ConsentimentoScreenProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasConsentedToDataProcessing, setHasConsentedToDataProcessing] = useState(false);

  const canContinue = hasReadTerms && hasConsentedToDataProcessing;

  function handleContinue() {
    if (!canContinue) return;
    onAccept();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {onBack ? (
          <IconButton
            variant="outline"
            style={styles.backButton}
            onPress={onBack}
            accessibilityLabel="Voltar para a tela de entrada"
            icon={<Ionicons name="arrow-back" size={20} color={colors.onSurface} />}
          />
        ) : null}

        <View style={styles.header}>
          <Text style={styles.title}>Antes de começar</Text>
          <Text style={styles.purposeText}>{APP_PURPOSE_TEXT}</Text>
        </View>

        <View style={styles.highlightList}>
          {DATA_PRACTICE_HIGHLIGHTS.map((highlight) => (
            <View key={highlight.title} style={styles.highlightRow}>
              <View style={styles.highlightTextGroup}>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.highlightDescription}>{highlight.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.legalSectionsGroup}>
          <LegalAccordion title="Termos de Uso" sections={TERMS_OF_USE_SECTIONS} />
          <LegalAccordion title="Política de Privacidade" sections={PRIVACY_POLICY_SECTIONS} />
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
