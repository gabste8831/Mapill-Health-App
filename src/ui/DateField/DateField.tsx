import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";

import { formatDateInput, parseDateInput, toDateInput } from "@/shared/date-input";
import { colors } from "@/shared/theme";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import { DatePicker } from "../DatePicker/DatePicker";
import { TextField } from "../TextField/TextField";
import { styles } from "./DateField.styles";

export type DateFieldProps = {
  label: string;
  required?: boolean;
  /** `DD/MM/AAAA` como está digitado — a tela continua dona do texto, com máscara e tudo. */
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | boolean;
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Limites do calendário. A tela que sabe a regra é quem passa: nascimento não é no futuro. */
  minimo?: Date;
  maximo?: Date;
};

/**
 * Data com as duas entradas: digitação e calendário.
 *
 * O calendário existe porque campo digitado aceita o que não existe — 31 de fevereiro, 30/02, o ano
 * pela metade —, e cada um desses só vira erro depois, longe de onde foi digitado. No calendário o
 * dia impossível não está lá para ser tocado.
 *
 * A digitação **não sai**, e isso é decisão e não sobra: quem sabe a data de cor a digita em três
 * segundos, enquanto no calendário precisa navegar meses para trás — o caso da data de nascimento,
 * que é a pior de todas para se caçar em calendário. É também o caminho que continua funcionando
 * se o componente nativo não carregar.
 */
export function DateField({
  label,
  required = false,
  value,
  onChangeText,
  placeholder = "DD/MM/AAAA",
  error,
  onFocus,
  minimo,
  maximo,
}: DateFieldProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [rascunho, setRascunho] = useState<string | null>(null);

  const isoAtual = parseDateInput(value);

  function abrir() {
    setRascunho(null);
    setSheetOpen(true);
  }

  function confirmar() {
    if (rascunho === null) return;
    onChangeText(toDateInput(rascunho));
    setSheetOpen(false);
  }

  return (
    <View style={styles.container}>
      <TextField
        label={label}
        required={required}
        placeholder={placeholder}
        value={value}
        onChangeText={(bruto) => onChangeText(formatDateInput(bruto, value))}
        onFocus={onFocus}
        keyboardType="number-pad"
        maxLength={10}
        error={error}
        containerStyle={styles.campo}
      />

      {/* Ao lado do campo, e não no lugar dele: as duas entradas convivem. O alvo tem a altura do
          input inteiro porque um ícone pequeno ao lado de um campo alto é o toque que erra. */}
      <Pressable
        style={styles.botaoDeCalendario}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={`Escolher ${label} no calendário`}>
        <Ionicons name="calendar-outline" size={22} color={colors.primary} />
      </Pressable>

      <BottomSheet visible={isSheetOpen} onClose={() => setSheetOpen(false)} title={label}>
        <View style={styles.sheetBody}>
          <DatePicker
            initialValue={isoAtual}
            onChange={setRascunho}
            minimo={minimo}
            maximo={maximo}
          />
          <View style={styles.linhaDeAcoes}>
            <Button
              label="Cancelar"
              variant="outline"
              emFolha
              style={styles.acao}
              onPress={() => setSheetOpen(false)}
            />
            {/* Mesma regra do relógio: a data em que o calendário abre é ponto de partida, não
                resposta. Confirmar sem tocar em nada gravaria hoje sem ninguém ter escolhido. */}
            <Button
              label="Confirmar"
              style={styles.acao}
              disabled={rascunho === null}
              onPress={confirmar}
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
