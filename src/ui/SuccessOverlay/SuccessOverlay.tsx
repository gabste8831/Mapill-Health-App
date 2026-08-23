import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { AccessibilityInfo, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/shared/theme";
import { styles } from "./SuccessOverlay.styles";

/**
 * Quanto o aviso fica na tela antes de começar a sair. Tempo de ler a frase inteira sem pressa —
 * mais curto que isso o aviso vira um susto, e a pessoa fica sem saber o que apareceu.
 */
const VISIBLE_MS = 2800;
const FADE_OUT_MS = 200;

export type SuccessOverlayProps = {
  title: string;
  description?: string;
  /** Chamado quando a confirmação termina — é aqui que a tela decide pra onde ir. */
  onDone: () => void;
};

/**
 * Confirmação de tela cheia, no estilo do comprovante de transferência de banco: some sozinha
 * depois de alguns segundos.
 *
 * Não é um `Alert` porque confirmar algo que deu certo não deveria exigir um toque — o botão "OK"
 * de um alerta é trabalho pedido à pessoa para receber uma notícia boa. E não é um toast porque o
 * cadastro de um medicamento é o fim de um fluxo longo: merece a pausa que diz "acabou, deu certo".
 */
export function SuccessOverlay({ title, description, onDone }: SuccessOverlayProps) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 180 });
    // Passa um pouco de 1 e volta: o exagero curto é o que faz o símbolo parecer "carimbado".
    scale.value = withSequence(
      withTiming(1.08, { duration: 260, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 140 }),
    );

    // Quem usa leitor de tela não vê o símbolo nem o sumiço automático — o anúncio é o que
    // entrega a mesma informação por outro canal.
    AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);

    // Dois timers em vez do callback do `withTiming`: aquele roda na thread de UI, e `onDone`
    // navega — o que só pode acontecer na thread de JS.
    const fadeOut = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT_MS });
    }, VISIBLE_MS);
    const done = setTimeout(onDone, VISIBLE_MS + FADE_OUT_MS);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [description, onDone, opacity, scale, title]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle]}
      accessibilityViewIsModal
      accessibilityRole="alert">
      <Animated.View style={[styles.check, checkStyle]}>
        <Ionicons name="checkmark" size={52} color={colors.onPrimary} />
      </Animated.View>

      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Animated.View>
  );
}
