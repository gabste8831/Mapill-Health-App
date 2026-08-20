import { useCallback, useRef } from "react";
import type { LayoutChangeEvent, ScrollView } from "react-native";

import { spacing } from "@/shared/theme";

/**
 * Abrir um item recolhível empurra o conteúdo pra baixo, e o texto recém-aberto costuma sobrar
 * fora da tela — a pessoa toca em "ler mais" e não vê nada mudar. Este hook guarda a posição de
 * cada bloco e rola até ele na expansão.
 *
 * Uso: `ref={scrollViewRef}` no `ScrollView`, `onLayout={registerItem(chave)}` no wrapper de
 * cada bloco e `onToggle={scrollToItem(chave)}` no recolhível.
 */
export function useScrollToExpanded() {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemOffsets = useRef<Record<string, number>>({});

  const registerItem = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      itemOffsets.current[key] = event.nativeEvent.layout.y;
    },
    [],
  );

  const scrollToItem = useCallback(
    (key: string) => (isExpanded: boolean) => {
      if (!isExpanded) return;
      const offset = itemOffsets.current[key];
      const scrollView = scrollViewRef.current;
      if (offset === undefined || scrollView === null) return;

      // Espera o layout reagir à expansão antes de rolar, senão a posição usada é a antiga.
      requestAnimationFrame(() => {
        scrollView.scrollTo({ y: Math.max(offset - spacing.md, 0), animated: true });
      });
    },
    [],
  );

  return { scrollViewRef, registerItem, scrollToItem };
}
