import { useState } from "react";
import { View } from "react-native";

import { formatDateInput, parseDateInput, toDateInput } from "@/shared/date-input";
import { TextField } from "../TextField/TextField";
import { styles } from "./DatePicker.styles";

import type { DatePickerProps } from "./DatePicker";

/**
 * Versão de navegador do calendário: o campo mascarado de sempre.
 *
 * O componente nativo é do Jetpack Compose e não existe no web. Em vez de portá-lo (§5.1 do plano:
 * web é vitrine, não alvo), o preview fica com a digitação — o que se perde ali é a prevenção de
 * erro, não a informação, e é no aparelho que a data é conferida de verdade.
 */
export function DatePicker({ initialValue, onChange }: DatePickerProps) {
  const [texto, setTexto] = useState(initialValue === null ? "" : toDateInput(initialValue));

  function handleChange(bruto: string) {
    const mascarado = formatDateInput(bruto, texto);
    setTexto(mascarado);
    // Igual ao nativo: só avisa quando existe uma data completa e válida, então meia data digitada
    // não habilita a confirmação lá fora.
    const iso = parseDateInput(mascarado);
    if (iso !== null) onChange(iso);
  }

  return (
    <View style={styles.container}>
      <TextField
        label=""
        placeholder="DD/MM/AAAA"
        value={texto}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={10}
        autoFocus
      />
    </View>
  );
}
