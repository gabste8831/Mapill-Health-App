import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import { Pressable, Text } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

import { colors } from "@/shared/theme";
import { styles } from "./Accordion.styles";

export type AccordionTone = "claro" | "azul";

export type AccordionProps = {
  title: string;
  children: ReactNode;
  /** "azul" destaca o resumo das práticas de dados; "claro" é o padrão dos textos longos. */
  tone?: AccordionTone;
  /** Rótulo ao lado da seta. Sem ele fica só a seta, pra blocos cuja função já é óbvia. */
  toggleLabel?: boolean;
  /** A tela usa pra rolar até o item recém-aberto, já que ele empurra o conteúdo abaixo. */
  onToggle?: (isExpanded: boolean) => void;
};

/**
 * Título sempre visível, conteúdo sob demanda. Recolhido por padrão: o título é o que precisa
 * ser lido de relance; o texto inteiro é para quem quiser se aprofundar.
 */
export function Accordion({ title, children, tone = "claro", toggleLabel = false, onToggle }: AccordionProps) {
  const [isExpanded, setExpanded] = useState(false);
  const isBlue = tone === "azul";
  const foreground = isBlue ? colors.onPrimary : colors.primary;

  function toggle() {
    const next = !isExpanded;
    setExpanded(next);
    onToggle?.(next);
  }

  return (
    // `layout` faz os irmãos deslizarem quando este cresce, em vez de saltarem de posição.
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[styles.section, isBlue && styles.sectionAzul]}>
      <Pressable
        style={styles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${isExpanded ? "Recolher" : "Expandir"} ${title}`}>
        <Text style={[styles.headerText, isBlue && styles.headerTextAzul]}>{title}</Text>

        {/* Um ou outro, nunca os dois: o rótulo já diz o que a seta diria. Mas algum dos dois
            precisa existir, senão nada indica que o bloco abre. */}
        {toggleLabel ? (
          <Text style={[styles.toggleLabel, { color: foreground }]}>
            {isExpanded ? "Ler menos" : "Ler mais"}
          </Text>
        ) : (
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={foreground} />
        )}
      </Pressable>

      {isExpanded ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(120)}
          style={styles.content}>
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
