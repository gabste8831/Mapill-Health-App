import { useEffect } from "react";
import { AccessibilityInfo, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Quanto tempo a barra leva para alcançar o novo valor.
 *
 * Longo o bastante para o olho pegar o movimento — abaixo de ~250ms a transição vira um salto com
 * borrão —, e curto o bastante para não competir com o toque seguinte: na agenda do dia é comum
 * confirmar duas ou três doses em sequência, e uma barra ainda correndo quando a próxima começa
 * pareceria travada.
 */
const DURACAO_MS = 420;

type BarraDeProgressoProps = {
  /** De 0 a 1. Valores fora da faixa são presos nela — quem calcula não precisa saber disso. */
  valor: number;
  trackStyle: ViewStyle;
  fillStyle: ViewStyle;
  /** Lido pelo leitor de tela no lugar da barra, que sozinha não diz nada. */
  accessibilityLabel: string;
};

/**
 * A barra que cresce, em vez de saltar.
 *
 * ## Por que animar isto e não a lista inteira
 *
 * O progresso do dia é a única coisa na Home que representa uma **grandeza que muda por causa de
 * algo que a pessoa acabou de fazer**. Ver a barra crescer é o que liga o toque em "Confirmar" ao
 * avanço do dia; sem isso o número novo simplesmente aparece, e a relação entre a ação e o efeito
 * fica por conta de quem estava olhando na hora certa.
 *
 * ## A largura vive na thread de UI
 *
 * `width` em porcentagem é animável pelo Reanimated e roda fora da thread de JS, então a barra não
 * engasga enquanto o registro da dose escreve no banco — que é exatamente quando ela anima.
 */
export function BarraDeProgresso({
  valor,
  trackStyle,
  fillStyle,
  accessibilityLabel,
}: BarraDeProgressoProps) {
  const alvo = Math.min(Math.max(valor, 0), 1);
  const largura = useSharedValue(alvo);

  /**
   * Respeita "reduzir movimento" do sistema.
   *
   * Quem liga essa opção costuma fazê-lo por enjoo ou vertigem causados por animação — e um app de
   * saúde é o último lugar onde ignorar isso seria aceitável. Com ela ligada o valor é atribuído
   * direto: a barra continua correta, só não se move.
   */
  const semMovimento = useReducedMotion();

  useEffect(() => {
    largura.value = semMovimento
      ? alvo
      : withTiming(alvo, { duration: DURACAO_MS, easing: Easing.out(Easing.cubic) });
  }, [alvo, largura, semMovimento]);

  const estiloAnimado = useAnimatedStyle(() => ({ width: `${largura.value * 100}%` }));

  return (
    <View
      style={trackStyle}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      // `now` em vez de `text`: leitores anunciam a mudança de valor sem reler o rótulo inteiro.
      accessibilityValue={{ min: 0, max: 100, now: Math.round(alvo * 100) }}>
      <Animated.View style={[fillStyle, estiloAnimado]} />
    </View>
  );
}

/**
 * Anuncia um marco de progresso a quem não vê a barra.
 *
 * Separado do componente porque nem todo avanço merece anúncio: interromper o leitor de tela a cada
 * dose confirmada é ruído, e ruído é o que ensina a desligar o leitor. Quem chama decide o momento.
 */
export function anunciarProgresso(frase: string): void {
  AccessibilityInfo.announceForAccessibility(frase);
}
