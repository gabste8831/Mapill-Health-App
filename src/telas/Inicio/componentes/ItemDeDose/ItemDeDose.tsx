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

/** Passando disso a transição começa a atrasar o toque seguinte. */
const ACOMODAR_MS = 260;

/**
 * Fora do componente porque `createAnimatedComponent` produz um tipo novo a cada chamada: criá-lo
 * no corpo remontaria a linha a cada render, perdendo a animação.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ItemDeDoseProps = {
  time: string;
  medicationName: string;
  /** Dose e orientação: "1 comprimido · com bastante água". */
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
  next: "PRÓXIMA",
  upcoming: "A SEGUIR",
};

/** O mesmo estado como frase: o rótulo visual é telegráfico demais para ser lido em voz alta. */
const STATUS_FALADO: Record<DoseVisualStatus, string> = {
  confirmed: "já tomada",
  skipped: "pulada",
  late: "atrasada",
  now: "é agora",
  next: "próxima dose",
  upcoming: "a seguir",
};

/**
 * Uma linha da agenda do dia. Só a próxima e as atrasadas mostram botões: oferecer "confirmar" numa
 * dose das 22h às 8 da manhã faria o app registrar intenção em vez de ingestão.
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
  const acionavel = status === "next" || status === "now" || status === "late";

  // A Home não navega depois de confirmar, então a transição é a única confirmação visual que
  // sobra quando o diálogo fecha.
  const opacidade = useSharedValue(resolvida ? 0.5 : 1);

  /** "Reduzir movimento" do sistema desliga a transição, não o resultado. */
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const alvo = resolvida ? 0.5 : 1;
    opacidade.value = semMovimento
      ? alvo
      : withTiming(alvo, { duration: ACOMODAR_MS, easing: Easing.out(Easing.quad) });
  }, [opacidade, resolvida, semMovimento]);

  const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidade.value }));

  /**
   * Sem agrupar, o TalkBack para quatro vezes na linha e anuncia o estado antes do nome do remédio.
   * O `accessible` junta os filhos num nó só, e este rótulo substitui a leitura solta deles.
   */
  const descricaoFalada = `${medicationName}, ${time}, ${STATUS_FALADO[status]}. ${note}`;

  return (
    /**
     * O cartão fica nesta `View`, e não no `AnimatedPressable` de dentro: o `boxShadow` do RN 0.86
     * não é aplicado por um componente do Reanimated 4 com `style` função, que é a assinatura que o
     * `Pressable` exige. O cartão saía sem fundo e sem sombra.
     */
    <View
      style={[
        styles.base,
        status === "next" && styles.highlighted,
        status === "now" && styles.now,
        status === "late" && styles.late,
      ]}>
      <AnimatedPressable
        /**
         * O `done` saiu da lista: a opacidade do estado resolvido agora vem de `estiloAnimado`, e
         * manter as duas faria a linha resolvida chegar a 0.25 — o estilo estático multiplicando o
         * valor animado.
         *
         * O toque só responde quando há o que tocar: linha não resolvida não navega para lugar
         * nenhum, e escurecer ao toque prometeria uma ação que não existe.
         */
        // O tipo do callback vem anotado à mão: `createAnimatedComponent` perde a assinatura do
        // `style` funcional do `Pressable` ao reembrulhar o componente.
        style={({ pressed }: { pressed: boolean }) => [
          styles.corpo,
          estiloAnimado,
          /**
           * O toque escurece **um pouco mais** o que a animação já deixou em 0.5, em vez de usar
           * `estadoDePressao`: aquele devolve uma opacidade absoluta, que sobrescreveria o valor
           * animado e faria a linha *clarear* ao ser tocada. Aqui as duas se somam, que é o que o
           * olho espera de um toque.
           *
           * Sem `scale`: esta é uma linha de largura total, e encolhê-la faz o texto vizinho
           * parecer tremer (ver `pressedScale`). E só quando há o que tocar — linha não resolvida
           * não navega para lugar nenhum, e responder ao toque prometeria uma ação que não existe.
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
      </AnimatedPressable>

      {acionavel ? (
        /**
         * Os botões **entram** quando a dose se torna acionável.
         *
         * Uma dose vira "É AGORA" sozinha, com a tela aberta e sem ninguém tocar em nada — é o
         * relógio que muda o estado. Sem transição, dois botões simplesmente aparecem no meio de
         * uma linha que estava quieta, e o movimento mais brusco da tela seria justamente o que
         * ninguém pediu. `FadeIn` faz a mesma aparição ser lida como algo que chegou.
         *
         * Irmãos do `AnimatedPressable`, e não filhos: dentro dele, cada toque em "Confirmar"
         * atravessava para o cartão, que na dose resolvida abre a correção retroativa.
         */
        <Animated.View
          style={styles.actions}
          entering={semMovimento ? undefined : FadeIn.duration(ACOMODAR_MS)}>
          {/* "Pular" à esquerda e "Confirmar" à direita: o destrutivo-ish primeiro e a ação
              esperada no canto onde o polegar chega — a mesma ordem de Cancelar/OK que o sistema
              usa, e que a mão já conhece sem precisar ler. */}
          {/* `hitSlop` vertical devolve os 44 de alvo que a caixa de 36 não tem mais: estes são os
              dois alvos mais tocados do app, e errar entre eles falseia o registro clínico. */}
          <Pressable
            style={estadoDePressao(styles.skipButton, { escala: true })}
            onPress={onSkip}
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`Pular ${medicationName}`}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </Pressable>
          <Pressable
            /**
             * Estes dois são os alvos mais tocados do app, e eram os únicos sem resposta ao toque —
             * o mesmo defeito que a varredura de 31/08 corrigiu no kit e não alcançou aqui, porque
             * a tela desenha os próprios botões (frente #3 do passe).
             *
             * `escala` é seguro: são alvos autocontidos, não linhas de largura total.
             */
            style={estadoDePressao(styles.confirmButton, { escala: true })}
            onPress={onConfirm}
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar ${medicationName}`}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}
