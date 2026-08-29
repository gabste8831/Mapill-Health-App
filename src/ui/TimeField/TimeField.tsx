import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { NativeSyntheticEvent, TargetedEvent } from "react-native";

import { formatTimeInput, parseTimeInput } from "@/shared/time-input";
import { colors } from "@/shared/theme";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import { TextField } from "../TextField/TextField";
import { TimePicker } from "../TimePicker/TimePicker";
import { styles } from "./TimeField.styles";

export type TimeFieldProps = {
  label: string;
  required?: boolean;
  /** `HH:MM` como está digitado — a tela continua dona do texto, com máscara e tudo. */
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  /** Sem o rótulo acima, para quando quem chama já escreveu um. */
  semRotulo?: boolean;
};

/**
 * Horário com as duas entradas: digitação e relógio — o mesmo padrão do `DateField`.
 *
 * **A digitação é o caminho principal.** Quem sabe que a dose é às 8 da manhã digita `0800` em dois
 * segundos; no relógio precisa abrir um popup, girar (ou preencher) e confirmar. A revisão em
 * aparelho apontou isso duas vezes, de ângulos opostos: primeiro que o mostrador analógico era
 * confuso, depois que o campo de digitação sozinho tinha virado etapas demais — tocar no campo para
 * abrir um popup que abre outro popup.
 *
 * O relógio fica no ícone ao lado, para quem preferir. É a mesma decisão do calendário no campo de
 * data: as duas entradas convivem, e quem escolhe é quem está com o celular na mão.
 */
export function TimeField({
  label,
  required = false,
  value,
  onChange,
  error,
  onFocus,
  semRotulo = false,
}: TimeFieldProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [rascunho, setRascunho] = useState<string | null>(null);

  const escolhido = parseTimeInput(value);

  function abrir() {
    setRascunho(null);
    setSheetOpen(true);
  }

  function confirmar() {
    if (rascunho === null) return;
    onChange(rascunho);
    setSheetOpen(false);
  }

  return (
    <View style={styles.container}>
      <TextField
        label={semRotulo ? "" : label}
        required={required}
        placeholder="HH:MM"
        value={value}
        // A máscara recusa o impossível na digitação: `50:00` não chega a entrar no campo.
        onChangeText={(bruto) => onChange(formatTimeInput(bruto, value))}
        onFocus={onFocus}
        keyboardType="number-pad"
        maxLength={5}
        error={error}
        containerStyle={styles.campo}
      />

      {/* Ao lado do campo, e não no lugar dele. O alvo tem a altura do input inteiro porque um
          ícone pequeno ao lado de um campo alto é o toque que erra. */}
      <Pressable
        style={[styles.botaoDeRelogio, semRotulo && styles.botaoDeRelogioSemRotulo]}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={`Escolher ${label} no relógio`}>
        <Ionicons name="time-outline" size={22} color={colors.primary} />
      </Pressable>

      <BottomSheet visible={isSheetOpen} onClose={() => setSheetOpen(false)} title={label}>
        <View style={styles.sheetBody}>
          <TimePicker initialValue={escolhido} onChange={setRascunho} />
          <View style={styles.linhaDeAcoes}>
            <Button
              label="Cancelar"
              variant="outline"
              emFolha
              style={styles.acao}
              onPress={() => setSheetOpen(false)}
            />
            {/* O horário em que o relógio abre é ponto de partida, não resposta: confirmar sem
                tocar em nada gravaria 08:00 sem ninguém ter escolhido. */}
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
