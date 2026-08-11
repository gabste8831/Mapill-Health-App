import { useCallback, useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView, TargetedEvent } from "react-native";
import { Dimensions, Keyboard, Platform } from "react-native";

// iOS dispara `keyboardWillShow` antes da animação começar (dá tempo de calcular sem "pulo"
// visível); Android não tem o evento "will", só o "did".
const KEYBOARD_SHOW_EVENT = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const KEYBOARD_HIDE_EVENT = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

/** Formato do host node que `measure` expõe na New Architecture (Fabric). */
type MeasurableNode = {
  measure: (
    callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void,
  ) => void;
};

/**
 * Padrão reutilizável pra qualquer formulário do app: ao focar um campo, centraliza ele na área
 * da tela que sobra visível acima do teclado — em vez de só empurrá-lo pra logo abaixo do topo,
 * o que ainda deixava a sensação de "campo jogado lá em cima". Importante pro público
 * idoso/polimedicado (heurística de prevenção de erros, `usability-heuristics-health-ui`).
 *
 * Uso: `const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();`,
 * passar `ref={scrollViewRef}` e `onScroll={onScroll}` (com `scrollEventThrottle={16}`) no
 * `ScrollView`/`KeyboardAwareScrollView`, e `onFocus={scrollToFocusedInput}` em cada `TextInput`.
 */
export function useScrollToFocusedInput() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(KEYBOARD_SHOW_EVENT, (event) => {
      keyboardHeightRef.current = event.endCoordinates.height;
    });
    const hideSubscription = Keyboard.addListener(KEYBOARD_HIDE_EVENT, () => {
      keyboardHeightRef.current = 0;
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const scrollToFocusedInput = useCallback((event: NativeSyntheticEvent<TargetedEvent>) => {
    const scrollView = scrollViewRef.current;
    const inputNode = event.target as unknown as MeasurableNode;
    if (scrollView === null || typeof inputNode?.measure !== "function") return;

    // Espera o teclado terminar de abrir pra saber a altura real da área visível — medir cedo
    // demais ainda usa a tela cheia e centraliza errado.
    setTimeout(() => {
      inputNode.measure((_x, _y, _width, fieldHeight, _pageX, fieldPageY) => {
        const screenHeight = Dimensions.get("window").height;
        const visibleAreaHeight = screenHeight - keyboardHeightRef.current;
        const fieldCenter = fieldPageY + fieldHeight / 2;
        const visibleAreaCenter = visibleAreaHeight / 2;
        const delta = fieldCenter - visibleAreaCenter;

        scrollView.scrollTo({ y: Math.max(scrollOffsetRef.current + delta, 0), animated: true });
      });
    }, 120);
  }, []);

  return { scrollViewRef, scrollToFocusedInput, onScroll };
}
