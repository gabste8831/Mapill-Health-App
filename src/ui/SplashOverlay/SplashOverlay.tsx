import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const DURATION = 600;

/**
 * Cobre a splash nativa e some com fade, evitando o corte seco entre a splash e a primeira
 * tela. Só desmonta depois da animação terminar (`withCallback`) — desmontar antes deixaria
 * um flash branco.
 */
export function SplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: { transform: [{ scale: 1 }], opacity: 1 },
    20: { opacity: 1 },
    70: { opacity: 0, easing: Easing.elastic(0.7) },
    100: { opacity: 0, transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
  });

  const image = <Image style={styles.image} source={require("@/assets/images/brand/mark-transparent-a.png")} />;

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
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 76,
    height: 71,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    // Mesmo azul do `expo-splash-screen` no app.json — se um mudar, o outro tem que mudar junto,
    // senão aparece um pisca de cor na troca.
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
