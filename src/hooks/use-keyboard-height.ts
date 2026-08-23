import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Altura do teclado agora, ou 0 quando ele está fechado.
 *
 * Existe porque `KeyboardAvoidingView` não resolve dentro de `Modal` no Android: o modal abre em
 * outra janela, que não recebe o `adjustResize` da activity, então o conteúdo simplesmente fica
 * embaixo do teclado. Medir a altura e empurrar o conteúdo à mão funciona nos dois sistemas.
 *
 * No iOS o evento é `Will` (dispara antes da animação, então a tela sobe junto com o teclado); no
 * Android só `Did` é confiável — `keyboardWillShow` não é emitido lá.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const aoAbrir = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates.height);
    });
    const aoFechar = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      aoAbrir.remove();
      aoFechar.remove();
    };
  }, []);

  return height;
}
