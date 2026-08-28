import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { parseTimeInput } from "@/shared/time-input";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import { TimePicker } from "../TimePicker/TimePicker";
import { styles } from "./TimeField.styles";

export type TimeFieldProps = {
  label: string;
  required?: boolean;
  /** `HH:MM` escolhido, ou vazio enquanto não há resposta. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/**
 * Um horário só, escolhido no relógio do sistema.
 *
 * Existe separado do `SeletorDeHorarios` do cadastro de medicamento porque as duas perguntas são
 * diferentes: lá são N horários de uma mesma posologia, que se comparam entre si e precisam ser
 * revistos em conjunto; aqui é **o** horário de um compromisso. Forçar o mesmo componente nos dois
 * lugares faria o de lá carregar um caso de uso que ele não tem, ou o daqui abrir uma lista de um
 * item só.
 *
 * O que é igual, e de propósito: o relógio nasce sem resposta e "Confirmar" só acende depois que
 * alguém gira. Horário pré-escolhido é o que quem tem pressa aceita sem ler.
 */
export function TimeField({ label, required = false, value, onChange, error }: TimeFieldProps) {
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
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>

      <Pressable
        style={[styles.botao, error !== undefined && styles.botaoErro]}
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={escolhido === null ? `Escolher ${label}` : `Alterar ${label}, ${escolhido}`}>
        <Text style={[styles.texto, escolhido === null && styles.textoVazio]}>
          {escolhido ?? "--:--"}
        </Text>
      </Pressable>

      {error !== undefined ? <Text style={styles.erro}>{error}</Text> : null}

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
