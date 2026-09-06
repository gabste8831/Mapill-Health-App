import type { StyleProp, ViewStyle } from "react-native";
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
  /** Ajuste do bloco externo, para telas onde o fundo padrão do acordeão não contrasta. */
  style?: StyleProp<ViewStyle>;
};

/** Termos de Uso / Política de Privacidade: o `Accordion` do kit com o texto legal dentro. */
export function LegalAccordion({ title, sections, style }: LegalAccordionProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <Accordion title={title} style={style}>
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
