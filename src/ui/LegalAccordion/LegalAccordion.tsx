import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { colors } from "@/shared/theme";
import { styles } from "./LegalAccordion.styles";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalAccordionProps = {
  title: string;
  sections: LegalSection[];
};

/**
 * Bloco recolhível com o texto completo dos Termos ou da Política. Recolhido por padrão: no
 * consentimento, o texto aberto empurraria os checkboxes para fora da tela.
 */
export function LegalAccordion({ title, sections }: LegalAccordionProps) {
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
