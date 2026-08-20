import { Text, View } from "react-native";

import { Accordion } from "@/ui/Accordion/Accordion";
import { styles } from "./LegalAccordion.styles";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalAccordionProps = {
  title: string;
  sections: LegalSection[];
  onToggle?: (isExpanded: boolean) => void;
};

/** Termos de Uso / Política de Privacidade: o `Accordion` do kit com o texto legal dentro. */
export function LegalAccordion({ title, sections, onToggle }: LegalAccordionProps) {
  return (
    <Accordion title={title} onToggle={onToggle}>
      {sections.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </Accordion>
  );
}
