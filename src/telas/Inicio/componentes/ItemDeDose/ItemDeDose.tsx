import { Pressable, Text, View } from "react-native";

import type { DoseVisualStatus } from "@/hooks/use-today-doses";
import { styles } from "./ItemDeDose.styles";

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
  const resolvida = status === "confirmed" || status === "skipped";
  // "Na hora" é o caso mais acionável de todos: é literalmente agora.
  const acionavel = status === "next" || status === "now" || status === "late";

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
    <Pressable
      style={[
        styles.base,
        status === "next" && styles.highlighted,
        status === "now" && styles.now,
        status === "late" && styles.late,
        resolvida && styles.done,
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
        <View style={styles.actions}>
          <Pressable
            style={styles.confirmButton}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar ${medicationName}`}>
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </Pressable>
          <Pressable
            style={styles.skipButton}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={`Pular ${medicationName}`}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}
