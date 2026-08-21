import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { formatTimeInput, parseTimeInput } from "@/shared/time-input";
import { BottomSheet, Button, TextField } from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

/** "1ª dose", "2ª dose"… — dentro do popup há largura pra escrever por extenso. */
const ORDINALS = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª", "12ª"];

type SeletorDeHorariosProps = {
  label: string;
  /** Texto mascarado de cada dose. O tamanho da lista é a quantidade de doses — vem de fora. */
  values: string[];
  onChange: (values: string[]) => void;
  /** Índices em conflito (mesmo horário duas vezes), marcados sem mensagem individual. */
  duplicateIndexes?: number[];
};

/**
 * Horários em popup, e não em campos no corpo da tela. Uma grade de doze campos de digitação
 * dominava o formulário inteiro por uma informação que se preenche uma vez e quase nunca se
 * revisita — aqui ela ocupa uma linha de fichinhas, e o preenchimento acontece com espaço.
 *
 * **Nada vem sugerido de propósito.** Horário pré-preenchido é o tipo de campo que a pessoa
 * apressada aceita sem ler, e aí o app passa a lembrar a dose na hora errada — errar em silêncio
 * é pior do que exigir a digitação.
 */
export function SeletorDeHorarios({
  label,
  values,
  onChange,
  duplicateIndexes = [],
}: SeletorDeHorariosProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const isEmpty = values.every((value) => value.length === 0);
  const pendentes = values.filter((value) => parseTimeInput(value) === null).length;

  function updateAt(index: number, raw: string) {
    onChange(values.map((current, i) => (i === index ? formatTimeInput(raw, current) : current)));
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {isEmpty ? (
        <Button
          label={values.length > 1 ? "Definir horários" : "Definir horário"}
          icon={<Ionicons name="add" size={20} color={colors.onPrimary} />}
          onPress={() => setSheetOpen(true)}
        />
      ) : (
        <Pressable
          style={styles.timeChipRow}
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Editar horários: ${values.join(", ")}`}>
          {values.map((value, index) => {
            // Meio horário digitado não pode virar ficha preenchida: quem bate o olho leria
            // "1" como uma hora resolvida e sairia da tela achando que terminou.
            const isPending = parseTimeInput(value) === null;
            return (
              <View
                // Índice como chave: os campos são posicionais e nenhum é inserido no meio.
                key={index}
                style={[
                  styles.timeChip,
                  isPending && styles.timeChipVazio,
                  duplicateIndexes.includes(index) && styles.timeChipErro,
                ]}>
                <Text style={styles.timeChipText}>{isPending ? "--:--" : value}</Text>
              </View>
            );
          })}
        </Pressable>
      )}

      {duplicateIndexes.length > 0 ? (
        <Text style={styles.fieldErrorText}>
          Dois horários iguais tocariam duas vezes pela mesma dose.
        </Text>
      ) : null}

      <BottomSheet visible={isSheetOpen} onClose={() => setSheetOpen(false)} title={label}>
        <View style={styles.sheetBody}>
          {values.map((value, index) => (
            <TextField
              key={index}
              label={values.length > 1 ? `${ORDINALS[index]} DOSE` : ""}
              placeholder="HH:MM"
              value={value}
              onChangeText={(raw) => updateAt(index, raw)}
              keyboardType="number-pad"
              maxLength={5}
              error={duplicateIndexes.includes(index) || parseTimeInput(value) === null}
            />
          ))}
          {/* O popup fecha mesmo incompleto — prender a pessoa aqui é pior que deixá-la voltar
              depois. Quem cobra o que falta é o resumo lá fora e o rodapé da tela. */}
          {pendentes > 0 ? (
            <Text style={styles.sectionHint}>
              {pendentes === 1
                ? "Falta preencher 1 horário."
                : `Faltam preencher ${pendentes} horários.`}
            </Text>
          ) : null}
          <Button label="Pronto" onPress={() => setSheetOpen(false)} />
        </View>
      </BottomSheet>
    </View>
  );
}
