import { Ionicons } from "@expo/vector-icons";
import { type ReactNode, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, withTiming } from "react-native-reanimated";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./Accordion.styles";

export type AccordionTone = "claro" | "azul";

export type AccordionProps = {
  title: string;
  children: ReactNode;
  /** "azul" destaca o resumo das práticas de dados; "claro" é o padrão dos textos longos. */
  tone?: AccordionTone;
  /** Rótulo ao lado da seta. Sem ele fica só a seta, pra blocos cuja função já é óbvia. */
  toggleLabel?: boolean;
  /**
   * Estado inicial. Existe para quem sai da tela e volta: sem isso o bloco renasce fechado, e quem
   * foi ler os termos no meio de um texto longo volta para o começo dele.
   */
  defaultExpanded?: boolean;
  /** Avisa a cada abre/fecha, para o pai lembrar onde a pessoa estava. */
  onToggle?: (isExpanded: boolean) => void;
};

const TIMING = { duration: 260, easing: Easing.out(Easing.cubic) };

/**
 * Título sempre visível, conteúdo sob demanda. Recolhido por padrão: o título é o que precisa
 * ser lido de relance; o texto inteiro é para quem quiser se aprofundar.
 */
export function Accordion({
  title,
  children,
  tone = "claro",
  toggleLabel = false,
  defaultExpanded = false,
  onToggle,
}: AccordionProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const [isExpanded, setExpanded] = useState(defaultExpanded);
  const isBlue = tone === "azul";
  const foreground = isBlue ? cores.onPrimary : cores.primary;

  /**
   * Animar a altura de 0 até a real é o que faz o bloco "descer". Antes o conteúdo entrava com
   * fade: a altura saltava de uma vez e só a opacidade animava, o que lê como pulo. O conteúdo
   * fica sempre montado e é recortado por `overflow: hidden`.
   *
   * Enquanto a medida não chega, `null` — e aí o clipe não impõe altura nenhuma, deixando o
   * conteúdo se medir sozinho. Fixar `0` antes da primeira medição faria o bloco abrir vazio no
   * primeiro toque, que é o que acontecia quando o conteúdo montava depois do layout.
   */
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight === null ? undefined : withTiming(isExpanded ? contentHeight : 0, TIMING),
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
    onToggle?.(next);
  }

  return (
    <View style={[styles.section, isBlue && styles.sectionAzul]}>
      <Pressable
        // Sem escala: o cabecalho ocupa a largura toda, e encolher faria o texto ao redor tremer.
        style={estadoDePressao(styles.header)}
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

      {/* O clipe recebe a altura animada; o conteúdo mede a si mesmo em posição absoluta, para que
          um pai de altura 0 não o comprima e estrague a medida.

          `collapsable={false}` é o que faz o `ScrollView` pai enxergar a mudança: sem ele o Android
          funde a árvore e o `contentSize` do scroll não é recalculado quando o bloco cresce — a
          rolagem descia mas não subia mais, que era o travamento em "Como funcionam os alertas". */}
      <Animated.View style={[styles.bodyClip, bodyStyle]} collapsable={false}>
        <View style={styles.bodyMeasure} onLayout={measureContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
