import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { CapsulaDoMapill } from "@/ui/CapsulaDoMapill/CapsulaDoMapill";

const DURATION = 600;

/**
 * Cobre a splash nativa e some com fade, evitando o corte seco entre a splash e a primeira
 * tela. Só desmonta depois da animação terminar (`withCallback`) — desmontar antes deixaria
 * um flash branco.
 */
export function SplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  /**
   * Esconder a splash nativa é feito **na montagem**, e não num `onLayout`.
   *
   * O `onLayout` só dispara quando a view é medida, e ao voltar de morte fria — fechar o app, tirar
   * dos recentes e abrir de novo — o Android pode restaurar a árvore sem uma nova passada de
   * layout nesta view. Aí `hideAsync` nunca era chamado e o app ficava preso no fundo azul, sem
   * saída a não ser fechar tudo outra vez. Um efeito de montagem não depende de medição: se este
   * componente existe, a splash tem que sair.
   *
   * `hideAsync` é idempotente e rejeita quando já não há splash — daí o `catch` vazio: chamar duas
   * vezes é normal, e não é erro que precise ser tratado.
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

  /**
   * A capsula desenhada, e nao mais o PNG do lockup.
   *
   * `mark-transparent-a.png` e a marca inteira em **1000x333** (a capsula e a palavra ao lado), e
   * aqui ela era desenhada num quadro de 76x71 — quase quadrado. A imagem entrava espremida e
   * recortada, e o que aparecia na tela era "Mapi": a palavra cortada no meio.
   *
   * A capsula sozinha e quadrada, entao cabe no quadro sem deformar — e e a mesma forma que a
   * splash nativa mostra, o que faz a troca entre as duas deixar de existir aos olhos de quem
   * abre o app.
   */
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
     * Mesmo azul do `expo-splash-screen` no `app.json` — se um mudar, o outro tem que mudar junto,
     * senão aparece um pisca de cor na troca.
     *
     * **Estava divergente até 02/09**: o `app.json` usa `#196FF3` e aqui havia `#208AEF`, então o
     * pisca que este comentário existe para evitar acontecia a cada abertura. Fica hardcoded de
     * propósito, e não vira token: é o único valor do app que precisa casar com uma configuração
     * **nativa**, fora do alcance do tema. `colors.primary` (`#0057BF`) é outro azul, mais escuro,
     * e usá-lo aqui só trocaria a divergência de lugar.
     */
    backgroundColor: "#196FF3",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
