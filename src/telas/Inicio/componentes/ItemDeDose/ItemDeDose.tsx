import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { DoseVisualStatus } from "@/hooks/use-today-doses";
import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./ItemDeDose.styles";

/**
 * O tempo que a linha leva para se acomodar no estado resolvido.
 *
 * A confirmação de dose é o gesto mais repetido do app — várias vezes por dia, às vezes três
 * seguidas no bloco de atrasadas. A transição existe para ligar o toque ao efeito, não para ser
 * apreciada: passando disso ela começa a atrasar o toque seguinte.
 */
const ACOMODAR_MS = 260;

/**
 * `Pressable` que aceita estilo animado.
 *
 * Fora do componente porque `createAnimatedComponent` produz um tipo novo a cada chamada: criá-lo
 * no corpo faria o React desmontar e remontar a linha inteira a cada render — perdendo justamente
 * a animação que ele existe para permitir.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ItemDeDoseProps = {
  time: string;
  medicationName: string;
  /** Dose e orientação — "1 comprimido · com bastante água". */
  note: string;
  status: DoseVisualStatus;
  onConfirm: () => void;
  onSkip: () => void;
  /** Tocar numa dose já resolvida abre a correção retroativa. */
  onCorrect: () => void;
};

const STATUS_LABEL: Record<DoseVisualStatus, string> = {
  confirmed: "TOMADA",
  skipped: "PULADA",
  late: "ATRASADA",
  now: "É AGORA",
  next: "PRÓXIMA DOSE",
  upcoming: "A SEGUIR",
};

/**
 * O mesmo estado, dito como frase — o rótulo visual é maiúsculo e telegráfico porque cabe num
 * canto de 64px, mas "ATRASADA" lido em voz alta soa como grito e não diz de quê.
 */
const STATUS_FALADO: Record<DoseVisualStatus, string> = {
  confirmed: "já tomada",
  skipped: "pulada",
  late: "atrasada",
  now: "é agora",
  next: "próxima dose",
  upcoming: "a seguir",
};

/**
 * Uma linha da agenda do dia.
 *
 * Só a próxima e as atrasadas mostram os botões de ação: oferecer "confirmar" numa dose das 22h às
 * 8 da manhã convida a marcar o que ainda não aconteceu, e o app passaria a registrar intenção em
 * vez de ingestão.
 */
export function ItemDeDose({
  time,
  medicationName,
  note,
  status,
  onConfirm,
  onSkip,
  onCorrect,
}: ItemDeDoseProps) {
  const styles = useEstilos(criarEstilos);

  const resolvida = status === "confirmed" || status === "skipped";
  // "Na hora" é o caso mais acionável de todos: é literalmente agora.
  const acionavel = status === "next" || status === "now" || status === "late";

  /**
   * A linha **se acomoda** quando a dose é resolvida, em vez de trocar de aparência num quadro.
   *
   * O `done` já levava a opacidade para 0.5, mas de uma vez: no instante em que o `Alert` fecha, a
   * linha simplesmente estava diferente. Animar os 0.5 é o que transforma "a tela mudou" em "o que
   * eu acabei de fazer teve efeito aqui" — e esta é a única confirmação visual que sobra depois que
   * o diálogo some, já que a Home não navega para lugar nenhum.
   */
  const opacidade = useSharedValue(resolvida ? 0.5 : 1);

  /**
   * "Reduzir movimento" do sistema desliga a transição, não o resultado.
   *
   * Quem liga essa opção costuma fazê-lo por enjoo ou vertigem — e num app de saúde ignorar isso
   * seria o pior lugar possível para uma escolha estética.
   */
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const alvo = resolvida ? 0.5 : 1;
    opacidade.value = semMovimento
      ? alvo
      : withTiming(alvo, { duration: ACOMODAR_MS, easing: Easing.out(Easing.quad) });
  }, [opacidade, resolvida, semMovimento]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidade.value }));

  /**
   * A linha inteira lida como **uma frase só**, na ordem em que a pessoa pensa: que remédio, a que
   * horas, como está.
   *
   * Sem agrupar, o TalkBack para quatro vezes numa linha — "08:00", "ATRASADA", "Dipirona", "1
   * comprimido" — e anuncia o estado antes do nome do remédio, que é o contrário do que se quer
   * ouvir. O `accessible` junta os filhos num nó só e este rótulo substitui a leitura solta deles.
   */
  const descricaoFalada = `${medicationName}, ${time}, ${STATUS_FALADO[status]}. ${note}`;

  return (
    <AnimatedPressable
      /**
       * O `done` saiu da lista: a opacidade do estado resolvido agora vem de `estiloAnimado`, e
       * manter as duas faria a linha resolvida chegar a 0.25 — o estilo estático multiplicando o
       * valor animado.
       *
       * O toque só responde quando há o que tocar: linha não resolvida não navega para lugar nenhum,
       * e escurecer ao toque prometeria uma ação que não existe.
       */
      // O tipo do callback vem anotado à mão: `createAnimatedComponent` perde a assinatura do
      // `style` funcional do `Pressable` ao reembrulhar o componente.
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        status === "next" && styles.highlighted,
        status === "now" && styles.now,
        status === "late" && styles.late,
        estiloAnimado,
        /**
         * O toque escurece **um pouco mais** o que a animação já deixou em 0.5, em vez de usar
         * `estadoDePressao`: aquele devolve uma opacidade absoluta, que sobrescreveria o valor
         * animado e faria a linha *clarear* ao ser tocada. Aqui as duas se somam, que é o que o
         * olho espera de um toque.
         *
         * Sem `scale`: esta é uma linha de largura total, e encolhê-la faz o texto vizinho parecer
         * tremer (ver `pressedScale`). E só quando há o que tocar — linha não resolvida não navega
         * para lugar nenhum, e responder ao toque prometeria uma ação que não existe.
         */
        pressed && resolvida && styles.pressionada,
      ]}
      onPress={resolvida ? onCorrect : undefined}
      // O agrupamento fica no bloco de informação, e **não** aqui: `accessible` no cartão inteiro
      // engoliria "Confirmar" e "Pular" num nó só, e o leitor de tela perderia justamente as duas
      // ações que importam.
      accessibilityRole={resolvida ? "button" : undefined}
      accessibilityLabel={
        resolvida ? `${descricaoFalada} Toque para corrigir o registro.` : undefined
      }>
      <View
        style={styles.infoAgrupada}
        accessible={!resolvida}
        accessibilityLabel={resolvida ? undefined : descricaoFalada}>
        <View style={styles.timeColumn}>
          <Text style={styles.time}>{time}</Text>
          <Text
            style={[
              styles.statusLabel,
              status === "upcoming" && styles.statusLabelUpcoming,
              status === "now" && styles.statusLabelNow,
              status === "late" && styles.statusLabelLate,
            ]}>
            {STATUS_LABEL[status]}
          </Text>
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.medicationName, status === "skipped" && styles.medicationNameSkipped]}>
            {medicationName}
          </Text>
          <Text style={styles.note}>{note}</Text>
        </View>
      </View>

      {acionavel ? (
        /**
         * Os botões **entram** quando a dose se torna acionável.
         *
         * Uma dose vira "É AGORA" sozinha, com a tela aberta e sem ninguém tocar em nada — é o
         * relógio que muda o estado. Sem transição, dois botões simplesmente aparecem no meio de
         * uma linha que estava quieta, e o movimento mais brusco da tela seria justamente o que
         * ninguém pediu. `FadeIn` faz a mesma aparição ser lida como algo que chegou.
         */
        <Animated.View style={styles.actions} entering={semMovimento ? undefined : FadeIn.duration(ACOMODAR_MS)}>
          <Pressable
            /**
             * Estes dois são os alvos mais tocados do app, e eram os únicos sem resposta ao toque —
             * o mesmo defeito que a varredura de 31/08 corrigiu no kit e não alcançou aqui, porque
             * a tela desenha os próprios botões (frente #3 do passe).
             *
             * `escala` é seguro: são alvos autocontidos numa coluna à direita, não linhas de
             * largura total.
             */
            style={estadoDePressao(styles.confirmButton, { escala: true })}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar ${medicationName}`}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </Pressable>
          <Pressable
            style={estadoDePressao(styles.skipButton, { escala: true })}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={`Pular ${medicationName}`}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </AnimatedPressable>
  );
}
