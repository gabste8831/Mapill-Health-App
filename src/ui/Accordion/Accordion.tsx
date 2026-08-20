import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";

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
};

const TIMING = { duration: 260, easing: Easing.out(Easing.cubic) };

/**
 * Título sempre visível, conteúdo sob demanda. Recolhido por padrão: o título é o que precisa
 * ser lido de relance; o texto inteiro é para quem quiser se aprofundar.
 */
export function Accordion({ title, children, tone = "claro", toggleLabel = false }: AccordionProps) {
  const [isExpanded, setExpanded] = useState(false);
  const isBlue = tone === "azul";
  const foreground = isBlue ? colors.onPrimary : colors.primary;

  /**
   * Animar a altura de 0 até a real é o que faz o bloco "descer". Antes o conteúdo entrava com
   * fade: a altura saltava de uma vez e só a opacidade animava, o que lê como pulo. O conteúdo
   * fica sempre montado e é recortado por `overflow: hidden`.
   */
  const [contentHeight, setContentHeight] = useState(0);

  const bodyStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? contentHeight : 0, TIMING),
    opacity: withTiming(isExpanded ? 1 : 0, TIMING),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? "180deg" : "0deg", TIMING) }],
  }));

  function measureContent(event: LayoutChangeEvent) {
    const measured = event.nativeEvent.layout.height;
    // `onLayout` dispara a cada reflow; sem a comparação, cada disparo causaria novo render.
    setContentHeight((current) => (current === measured ? current : measured));
  }

  function toggle() {
    const next = !isExpanded;
    setExpanded(next);
  }

  return (
    <View style={[styles.section, isBlue && styles.sectionAzul]}>
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
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={18} color={foreground} />
          </Animated.View>
        )}
      </Pressable>

      <Animated.View style={[styles.bodyClip, bodyStyle]}>
        {/* Absoluto pra medir a altura natural: dentro de um pai com altura 0 o conteúdo seria
            comprimido e a medida sairia errada. */}
        <View style={styles.bodyMeasure} onLayout={measureContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
