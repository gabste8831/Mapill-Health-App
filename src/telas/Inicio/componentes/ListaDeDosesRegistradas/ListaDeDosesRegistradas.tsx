import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./ListaDeDosesRegistradas.styles";

export type DoseRegistrada = {
  doseScheduleId: string;
  time: string;
  medicationName: string;
  /** Dose e orientação — "1 comprimido · com bastante água". */
  note: string;
  /** `true` = tomada, `false` = pulada. */
  tomada: boolean;
};

type ListaDeDosesRegistradasProps = {
  doses: DoseRegistrada[];
  /** Tocar numa dose já resolvida abre a correção retroativa. */
  onCorrigir: (doseScheduleId: string) => void;
};

/**
 * As doses de hoje que já foram respondidas, em lista compacta.
 *
 * ## Por que não são cartões como as pendentes
 *
 * As duas listas respondem perguntas diferentes. A de cima pergunta "o que falta?" e precisa de
 * botões, cor de urgência e área de toque generosa. Esta responde "o que eu já fiz?" — é conferência,
 * e quem confere varre a coluna de horários de cima a baixo em vez de ler cartão por cartão.
 *
 * Em cartões, o efeito era perverso: quanto mais em dia a pessoa estivesse, mais cheia ficava a
 * Home, e as doses pendentes iam sendo empurradas para longe pelas já resolvidas. A forma compacta
 * é a mesma da agenda do Calendário, onde esse enxugamento já tinha funcionado.
 *
 * O toque continua abrindo a correção retroativa em cada linha: encolher o registro não pode custar
 * a chance de corrigir um "pulei" que era "tomei".
 */
export function ListaDeDosesRegistradas({ doses, onCorrigir }: ListaDeDosesRegistradasProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      {doses.map((dose, indice) => (
        <Pressable
          key={dose.doseScheduleId}
          style={estadoDePressao([styles.linha, indice > 0 && styles.linhaComDivisoria])}
          onPress={() => onCorrigir(dose.doseScheduleId)}
          accessibilityRole="button"
          /**
           * A linha inteira num nó só, na ordem em que se lê: que horas, o quê, quanto, como ficou.
           *
           * Sem agrupar, o TalkBack para quatro vezes na mesma linha, e o desfecho — que é a
           * informação pela qual se veio até aqui — sairia solto no fim sem se ligar ao remédio.
           */
          accessibilityLabel={`${dose.time}, ${dose.medicationName}, ${dose.note}, ${
            dose.tomada ? "tomada" : "pulada"
          }. Toque para corrigir.`}>
          <Text style={styles.hora}>{dose.time}</Text>

          <View style={styles.texto}>
            <Text style={styles.nome} numberOfLines={1}>
              {dose.medicationName}
            </Text>
            <Text style={styles.nota} numberOfLines={1}>
              {dose.note}
            </Text>
          </View>

          {/* O ícone é o único portador do desfecho na linha, e o rótulo falado dele já está no
              `accessibilityLabel` do grupo — marcá-lo aqui de novo faria o TalkBack repetir
              "tomada" duas vezes na mesma parada. */}
          <Ionicons
            name={dose.tomada ? "checkmark-circle" : "close-circle"}
            size={20}
            color={dose.tomada ? cores.successVivo : cores.errorVivo}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </Pressable>
      ))}
    </View>
  );
}
