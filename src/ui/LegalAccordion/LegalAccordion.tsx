import { Text, View } from "react-native";

import { Accordion } from "@/ui/Accordion/Accordion";
import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./LegalAccordion.styles";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalAccordionProps = {
  title: string;
  sections: LegalSection[];
};

/** Termos de Uso / Política de Privacidade: o `Accordion` do kit com o texto legal dentro. */
export function LegalAccordion({ title, sections }: LegalAccordionProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <Accordion title={title}>
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
