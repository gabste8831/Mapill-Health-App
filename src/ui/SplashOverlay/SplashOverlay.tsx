import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { CapsulaDoMapill } from "@/ui/CapsulaDoMapill/CapsulaDoMapill";

const DURATION = 600;

/**
 * Cobre a splash nativa e some com fade, evitando o corte seco entre a splash e a primeira
 * tela. Só desmonta depois da animação terminar (`withCallback`) - desmontar antes deixaria
 * um flash branco.
 */
export function SplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  /**
   * Na montagem, e nao num `onLayout`: aquele so dispara quando a view e medida, e ao voltar de
   * morte fria o Android pode restaurar a arvore sem nova passada de layout. O app ficava preso no
   * fundo azul. `hideAsync` rejeita quando ja nao ha splash, dai o `catch` vazio.
   */
  useEffect(() => {
    let cancelado = false;
    SplashScreen.hideAsync()
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setAnimate(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: { transform: [{ scale: 1 }], opacity: 1 },
    20: { opacity: 1 },
    70: { opacity: 0, easing: Easing.elastic(0.7) },
    100: { opacity: 0, transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
  });

  // A capsula desenhada, e nao o PNG do lockup: aquele e a marca inteira em 1000x333, e num quadro
  // quase quadrado entrava espremido, mostrando a palavra cortada no meio.
  const image = <CapsulaDoMapill tamanho={96} sobreAzul />;

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {image}
    </Animated.View>
  ) : (
    // Estático enquanto o efeito acima não libera a animação: cobre a troca entre a splash nativa
    // e a primeira tela sem depender de nenhum evento de layout.
    <View style={styles.splashOverlay}>{image}</View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    /**
     * Mesmo azul do `expo-splash-screen` no `app.json`: divergindo, aparece um pisca de cor na
     * troca. Hardcoded de proposito, e nao token, porque e o unico valor que precisa casar com uma
     * configuracao nativa, fora do alcance do tema.
     */
    backgroundColor: "#196FF3",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
