import { useState } from "react";
import { View } from "react-native";

import { formatTimeInput, parseTimeInput } from "@/shared/time-input";
import { TextField } from "../TextField/TextField";
import { styles } from "./TimePicker.styles";

import type { TimePickerProps } from "./TimePicker";

/**
 * Versão de navegador do relógio: o campo mascarado de sempre.
 *
 * O componente nativo é do Jetpack Compose e não existe no web. Em vez de portá-lo (§5.1 do
 * plano: web é vitrine, não alvo), o preview fica com a digitação — o que se perde ali é o gesto,
 * não a informação, e é no aparelho que o horário é conferido de verdade.
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  const [texto, setTexto] = useState(initialValue ?? "");

  function handleChange(bruto: string) {
    const mascarado = formatTimeInput(bruto, texto);
    setTexto(mascarado);
    // Igual ao nativo: só avisa quando existe resposta de verdade, então meio horário digitado
    // não habilita a confirmação lá fora.
    if (parseTimeInput(mascarado) !== null) onChange(mascarado);
  }

  return (
    <View style={styles.container}>
      <TextField
        label=""
        placeholder="HH:MM"
        value={texto}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={5}
        autoFocus
      />
    </View>
  );
}
