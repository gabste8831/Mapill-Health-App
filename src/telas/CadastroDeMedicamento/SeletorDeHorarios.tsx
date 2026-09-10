import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { formatDecimalInput, formatIntegerInput } from "@/shared/number-input";
import {
  horariosEmSerie,
  MAX_INTERVALO_EM_HORAS,
  parseTimeInput,
  serieCabeNoDia,
} from "@/shared/time-input";
import { BottomSheet, Button, TextField, TimeField, TimePicker } from "@/ui";
import { criarEstilos } from "./CadastroDeMedicamento.styles";

const ORDINALS = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª", "11ª", "12ª"];

/** Uma linha do popup: o horário escolhido e, opcionalmente, a dose só dele. */
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

type ModoDoPopup = { tipo: "lista" } | { tipo: "serie" } | { tipo: "relogioDaSerie" };

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
 * Nada de horário sugerido: campo pré-preenchido é aceito sem ler, e o app passaria a lembrar na
 * hora errada. O relógio ocupa o mesmo popup, porque modal dentro de modal tira o destino do
 * botão físico de voltar no Android.
 */
export function SeletorDeHorarios({
  label,
  values,
  onChange,
  duplicateIndexes = [],
  variacao,
}: SeletorDeHorariosProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const [isSheetOpen, setSheetOpen] = useState(false);
  // União em vez de três booleanos: assim a série aberta por cima do relógio nem é representável.
  const [modo, setModo] = useState<ModoDoPopup>({ tipo: "lista" });
  // `null` significa que ninguém tocou no relógio: a posição em que ele abriu não é resposta.
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [intervaloInput, setIntervaloInput] = useState("");
  const [primeiroDaSerie, setPrimeiroDaSerie] = useState<string | null>(null);

  const isEmpty = values.every((value) => value.at.length === 0);
  const pendentes = values.filter((value) => parseTimeInput(value.at) === null).length;

  const intervalo = Number(intervaloInput);
  const intervaloValido =
    intervaloInput.length > 0 && intervalo >= 1 && intervalo <= MAX_INTERVALO_EM_HORAS;
  const serieCabe = intervaloValido && serieCabeNoDia(intervalo, values.length);
  const previaDaSerie =
    intervaloValido && serieCabe && primeiroDaSerie !== null
      ? horariosEmSerie(primeiroDaSerie, intervalo, values.length)
      : null;

  function abrirSerie() {
    setIntervaloInput("");
    setPrimeiroDaSerie(null);
    setModo({ tipo: "serie" });
  }

  /** A série substitui os horários e preserva a dose de cada linha, que é resposta de outro eixo. */
  function aplicarSerie() {
    if (previaDaSerie === null) return;
    onChange(values.map((current, i) => ({ ...current, at: previaDaSerie[i] })));
    setModo({ tipo: "lista" });
  }

  function updateAmount(index: number, raw: string) {
    const amount = variacao?.aceitaFracao === true ? formatDecimalInput(raw) : formatIntegerInput(raw);
    onChange(values.map((current, i) => (i === index ? { ...current, amount } : current)));
  }

  /**
   * Ordena ao fechar porque a posologia já é ordenada no salvamento, e a tela mostrava a ordem
   * digitada. A dose viaja junto com o horário, senão reordenar trocaria em silêncio quanto se
   * toma de manhã e à noite.
   */
  function handleClose() {
    const preenchidos = values
      .filter((value) => parseTimeInput(value.at) !== null)
      .sort((a, b) => a.at.localeCompare(b.at));
    const pendentesVazios = values.filter((value) => parseTimeInput(value.at) === null);
    onChange([...preenchidos, ...pendentesVazios]);
    // Sem isto o teclado fica aberto cobrindo a tela de trás.
    Keyboard.dismiss();
    setSheetOpen(false);
  }

  /**
   * Fundo escurecido ou botão físico de voltar. Fora da lista, volta para o conteúdo anterior do
   * popup, senão a pessoa perderia os horários já escolhidos.
   */
  function handleRequestClose() {
    if (modo.tipo === "serie") {
      setRascunho(null);
      setModo({ tipo: "lista" });
      return;
    }
    if (modo.tipo === "relogioDaSerie") {
      setRascunho(null);
      setModo({ tipo: "serie" });
      return;
    }
    handleClose();
  }

  /** O que a ficha mostra: "08:00" ou "08:00 · 10", quando aquele horário tem dose própria. */
  function textoDaFicha(value: EntradaDeDose): string {
    if (parseTimeInput(value.at) === null) return "--:--";
    if (variacao?.ativa !== true || value.amount.trim().length === 0) return value.at;
    return `${value.at} · ${value.amount}`;
  }

  function tituloDoPopup(): string {
    if (modo.tipo === "serie") return "De quantas em quantas horas";
    if (modo.tipo === "relogioDaSerie") return "Primeiro horário";
    return label;
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {isEmpty ? (
        <Button
          label={values.length > 1 ? "Definir horários" : "Definir horário"}
          icon={<Ionicons name="add" size={20} color={cores.onPrimary} />}
          onPress={() => setSheetOpen(true)}
        />
      ) : (
        <Pressable
          style={estadoDePressao(styles.timeChipRow)}
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Editar horários: ${values.map((value) => value.at).join(", ")}`}>
          {values.map((value, index) => {
            const isPending = parseTimeInput(value.at) === null;
            const duplicado = duplicateIndexes.includes(index);
            return (
              <View
                // Índice como chave: os campos são posicionais e nenhum é inserido no meio.
                key={index}
                style={[
                  styles.timeChip,
                  isPending && styles.timeChipVazio,
                  duplicado && styles.timeChipErro,
                ]}
                // Quem não distingue a cor precisa saber qual horário repetiu, então o rótulo diz.
                accessibilityLabel={
                  duplicado
                    ? `${textoDaFicha(value)}, horário repetido`
                    : textoDaFicha(value)
                }>
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

      <BottomSheet visible={isSheetOpen} onClose={handleRequestClose} title={tituloDoPopup()}>
        {modo.tipo === "relogioDaSerie" ? (
          <View style={styles.sheetBody}>
            <TimePicker initialValue={primeiroDaSerie} onChange={setRascunho} />
            <View style={styles.linhaDeAcoes}>
              <Button
                label="Cancelar"
                variant="outline"
                emFolha
                style={styles.acaoDaLinha}
                onPress={handleRequestClose}
              />
              <Button
                label="Confirmar"
                style={styles.acaoDaLinha}
                disabled={rascunho === null}
                onPress={() => {
                  setPrimeiroDaSerie(rascunho);
                  setRascunho(null);
                  setModo({ tipo: "serie" });
                }}
              />
            </View>
          </View>
        ) : modo.tipo === "serie" ? (
          <View style={styles.sheetBody}>
            <TextField
              label={`DE QUANTAS EM QUANTAS HORAS (${values.length} doses)`}
              placeholder="Ex: 8"
              value={intervaloInput}
              onChangeText={(raw) => setIntervaloInput(formatIntegerInput(raw, 2))}
              keyboardType="number-pad"
              maxLength={2}
              error={
                intervaloValido && !serieCabe
                  ? `${values.length} doses de ${intervalo} em ${intervalo} horas passam de um dia, e alguma cairia em cima da outra.`
                  : undefined
              }
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primeiro horário</Text>
              <Pressable
                style={estadoDePressao(styles.botaoDeHorario)}
                onPress={() => {
                  setRascunho(null);
                  setModo({ tipo: "relogioDaSerie" });
                }}
                accessibilityRole="button"
                accessibilityLabel="Escolher o primeiro horário da série">
                <Text
                  style={[
                    styles.botaoDeHorarioTexto,
                    primeiroDaSerie === null && styles.botaoDeHorarioVazio,
                  ]}>
                  {primeiroDaSerie ?? "--:--"}
                </Text>
              </Pressable>
            </View>

            {previaDaSerie !== null ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Ficaria assim</Text>
                <View style={styles.timeChipRow}>
                  {previaDaSerie.map((horario, index) => (
                    <View key={index} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{horario}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {variacao !== undefined ? (
              <Text style={styles.sectionHint}>
                {variacao.ativa
                  ? "As doses que você definiu por horário são mantidas. A série só recalcula as horas."
                  : "Depois de preencher, dá para marcar “A dose muda de um horário para o outro” na lista."}
              </Text>
            ) : null}

            <View style={styles.linhaDeAcoes}>
              <Button
                label="Cancelar"
                variant="outline"
                emFolha
                style={styles.acaoDaLinha}
                onPress={handleRequestClose}
              />
              <Button
                label="Preencher"
                style={styles.acaoDaLinha}
                disabled={previaDaSerie === null}
                onPress={aplicarSerie}
              />
            </View>
          </View>
        ) : (
          <View style={styles.sheetBody}>
            {values.map((value, index) => (
              <View key={index} style={variacao?.ativa === true ? styles.linhaDeDose : undefined}>
                <View
                  style={[
                    styles.fieldGroup,
                    variacao?.ativa === true ? styles.campoDeHorario : undefined,
                  ]}>
                  {values.length > 1 ? (
                    <Text style={styles.fieldLabel}>{`${ORDINALS[index]} DOSE`}</Text>
                  ) : null}
                  <TimeField
                    label={`${ORDINALS[index]} dose`}
                    semRotulo
                    value={value.at}
                    onChange={(horario) =>
                      onChange(
                        values.map((current, i) =>
                          i === index ? { ...current, at: horario } : current,
                        ),
                      )
                    }
                    error={duplicateIndexes.includes(index)}
                  />
                </View>
                {variacao?.ativa === true ? (
                  <TextField
                    label={variacao.unitNoun}
                    containerStyle={styles.campoDeQuantidade}
                    // Placeholder e não valor: em branco continua significando "herda a dose geral".
                    placeholder={variacao.defaultAmount}
                    value={value.amount}
                    onChangeText={(raw) => updateAmount(index, raw)}
                    keyboardType={variacao.aceitaFracao ? "decimal-pad" : "number-pad"}
                    maxLength={8}
                  />
                ) : null}
              </View>
            ))}

            {values.length > 1 ? (
              <Button label="Preencher de X em X horas" variant="text" onPress={abrirSerie} />
            ) : null}

            {pendentes > 0 ? (
              <Text style={styles.sectionHint}>
                {pendentes === 1
                  ? "Falta escolher 1 horário."
                  : `Faltam escolher ${pendentes} horários.`}
              </Text>
            ) : null}
            <Button label="Pronto" onPress={handleClose} />
          </View>
        )}
      </BottomSheet>
    </View>
  );
}
