import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { TimeOfDay } from "@/domain/entities/prescription";
import { formatTimeInput, parseTimeInput } from "@/shared/time-input";
import { colors } from "@/shared/theme";
import { Button, TextField } from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

type EditorDeHorariosProps = {
  times: TimeOfDay[];
  onChange: (times: TimeOfDay[]) => void;
};

/**
 * Lista de horários com adição e remoção. Horário repetido é bloqueado na entrada, e não no
 * submit: dois alarmes no mesmo minuto tocariam duas vezes pela mesma dose, e o paciente teria
 * que descobrir sozinho qual das duas confirmar.
 */
export function EditorDeHorarios({ times, onChange }: EditorDeHorariosProps) {
  const [draft, setDraft] = useState("");

  const parsed = parseTimeInput(draft);
  const isDuplicate = parsed !== null && times.includes(parsed);
  const error =
    draft.length === 0
      ? undefined
      : isDuplicate
        ? "Esse horário já está na lista."
        : draft.length === 5 && parsed === null
          ? "Horário inválido."
          : undefined;

  function addTime() {
    if (parsed === null || isDuplicate) return;
    // Ordenado: a lista é lida como a rotina do dia, e fora de ordem ela deixa de fazer sentido.
    onChange([...times, parsed].sort());
    setDraft("");
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>HORÁRIOS</Text>

      {times.length > 0 ? (
        <View style={styles.timeList}>
          {times.map((time) => (
            <View key={time} style={styles.timeChip}>
              <Text style={styles.timeChipText}>{time}</Text>
              <Pressable
                onPress={() => onChange(times.filter((current) => current !== time))}
                accessibilityRole="button"
                accessibilityLabel={`Remover horário ${time}`}>
                <Ionicons name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyHint}>Nenhum horário adicionado ainda.</Text>
      )}

      <View style={styles.timeInputRow}>
        <TextField
          label=""
          containerStyle={styles.timeInputField}
          placeholder="HH:MM"
          value={draft}
          onChangeText={(value) => setDraft(formatTimeInput(value, draft))}
          onSubmitEditing={addTime}
          keyboardType="number-pad"
          maxLength={5}
          error={error}
        />
        <Button
          label="Adicionar"
          style={styles.timeAddButton}
          disabled={parsed === null || isDuplicate}
          onPress={addTime}
        />
      </View>
    </View>
  );
}
