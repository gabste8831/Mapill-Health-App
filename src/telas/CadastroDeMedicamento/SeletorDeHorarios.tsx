import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { formatDecimalInput, formatIntegerInput } from "@/shared/number-input";
import { formatTimeInput, parseTimeInput } from "@/shared/time-input";
import { BottomSheet, Button, Checkbox, TextField } from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

/** "1ª dose", "2ª dose"… — dentro do popup há largura pra escrever por extenso. */
const ORDINALS = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª", "12ª"];

/** Uma linha do popup: o horário mascarado e, opcionalmente, a dose só dele. */
export type EntradaDeDose = {
  at: string;
  /** Vazio = herda a dose geral do tratamento. */
  amount: string;
};

export function entradasVazias(quantidade: number): EntradaDeDose[] {
  return Array.from({ length: quantidade }, () => ({ at: "", amount: "" }));
}

type VariacaoDeDose = {
  ativa: boolean;
  onChange: (ativa: boolean) => void;
  /** Substantivo da unidade, já flexionado ("comprimidos", "unidades (UI)"). */
  unitNoun: string;
  /** A dose geral já respondida — é o que cada horário vale enquanto ninguém mexe nele. */
  defaultAmount: string;
  /** Meio comprimido existe, meia gota não. Vem da unidade, não do campo. */
  aceitaFracao: boolean;
};

type SeletorDeHorariosProps = {
  label: string;
  /** O tamanho da lista é a quantidade de doses — vem de fora, decidido pela frequência. */
  values: EntradaDeDose[];
  onChange: (values: EntradaDeDose[]) => void;
  /** Índices em conflito (mesmo horário duas vezes), marcados sem mensagem individual. */
  duplicateIndexes?: number[];
  /** Ausente onde dose por horário não faz sentido — no intervalo só existe uma dose. */
  variacao?: VariacaoDeDose;
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
  variacao,
}: SeletorDeHorariosProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const isEmpty = values.every((value) => value.at.length === 0);
  const pendentes = values.filter((value) => parseTimeInput(value.at) === null).length;

  function updateAt(index: number, raw: string) {
    onChange(
      values.map((current, i) =>
        i === index ? { ...current, at: formatTimeInput(raw, current.at) } : current,
      ),
    );
  }

  function updateAmount(index: number, raw: string) {
    const amount = variacao?.aceitaFracao === true ? formatDecimalInput(raw) : formatIntegerInput(raw);
    onChange(values.map((current, i) => (i === index ? { ...current, amount } : current)));
  }

  /**
   * Os horários são de um mesmo dia, então "1ª" e "2ª" não são escolha de quem preenche: quem
   * decide a ordem é o relógio. Digitar 04:00 na primeira linha e 02:00 na segunda descreve o
   * mesmo dia que a ordem inversa — e era isso que acontecia calado, porque a posologia já era
   * ordenada na hora de salvar enquanto a tela continuava mostrando a ordem digitada.
   *
   * Ordenar ao fechar deixa o reordenamento **visível**: a pessoa fecha o popup e vê as fichinhas
   * na ordem em que o dia vai acontecer. A dose de cada horário viaja junto, senão trocar a ordem
   * trocaria em silêncio quanto se toma de manhã e à noite — que é o erro que este campo existe
   * pra evitar. Horário pela metade vai pro fim, pra linha em branco não pular debaixo do dedo.
   */
  function handleClose() {
    const preenchidos = values
      .filter((value) => parseTimeInput(value.at) !== null)
      .sort((a, b) => a.at.localeCompare(b.at));
    const pendentesVazios = values.filter((value) => parseTimeInput(value.at) === null);
    onChange([...preenchidos, ...pendentesVazios]);
    setSheetOpen(false);
  }

  /** O que a ficha mostra: "08:00" ou "08:00 · 10", quando aquele horário tem dose própria. */
  function textoDaFicha(value: EntradaDeDose): string {
    if (parseTimeInput(value.at) === null) return "--:--";
    if (variacao?.ativa !== true || value.amount.trim().length === 0) return value.at;
    return `${value.at} · ${value.amount}`;
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
          accessibilityLabel={`Editar horários: ${values.map((value) => value.at).join(", ")}`}>
          {values.map((value, index) => {
            // Meio horário digitado não pode virar ficha preenchida: quem bate o olho leria
            // "1" como uma hora resolvida e sairia da tela achando que terminou.
            const isPending = parseTimeInput(value.at) === null;
            return (
              <View
                // Índice como chave: os campos são posicionais e nenhum é inserido no meio.
                key={index}
                style={[
                  styles.timeChip,
                  isPending && styles.timeChipVazio,
                  duplicateIndexes.includes(index) && styles.timeChipErro,
                ]}>
                <Text style={styles.timeChipText}>{textoDaFicha(value)}</Text>
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

      <BottomSheet visible={isSheetOpen} onClose={handleClose} title={label}>
        <View style={styles.sheetBody}>
          {values.map((value, index) => (
            <View key={index} style={variacao?.ativa === true ? styles.linhaDeDose : undefined}>
              <TextField
                label={values.length > 1 ? `${ORDINALS[index]} DOSE` : ""}
                containerStyle={variacao?.ativa === true ? styles.campoDeHorario : undefined}
                placeholder="HH:MM"
                value={value.at}
                onChangeText={(raw) => updateAt(index, raw)}
                keyboardType="number-pad"
                maxLength={5}
                error={duplicateIndexes.includes(index) || parseTimeInput(value.at) === null}
              />
              {variacao?.ativa === true ? (
                <TextField
                  label={variacao.unitNoun.toUpperCase()}
                  containerStyle={styles.campoDeQuantidade}
                  // Placeholder e não valor: mostra o que vale hoje sem fingir que foi digitado,
                  // então deixar em branco continua significando "o mesmo de sempre".
                  placeholder={variacao.defaultAmount}
                  value={value.amount}
                  onChangeText={(raw) => updateAmount(index, raw)}
                  keyboardType={variacao.aceitaFracao ? "decimal-pad" : "number-pad"}
                  maxLength={8}
                />
              ) : null}
            </View>
          ))}

          {variacao !== undefined && values.length > 1 ? (
            <Checkbox
              checked={variacao.ativa}
              onChange={variacao.onChange}
              label="A dose muda de um horário para o outro"
              accessibilityLabel="A dose muda de um horário para o outro"
            />
          ) : null}

          {/* O popup fecha mesmo incompleto — prender a pessoa aqui é pior que deixá-la voltar
              depois. Quem cobra o que falta é o resumo lá fora e o rodapé da tela. */}
          {pendentes > 0 ? (
            <Text style={styles.sectionHint}>
              {pendentes === 1
                ? "Falta preencher 1 horário."
                : `Faltam preencher ${pendentes} horários.`}
            </Text>
          ) : null}
          <Button label="Pronto" onPress={handleClose} />
        </View>
      </BottomSheet>
    </View>
  );
}
