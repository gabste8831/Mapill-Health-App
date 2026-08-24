import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { formatDecimalInput, formatIntegerInput } from "@/shared/number-input";
import {
  horariosEmSerie,
  MAX_INTERVALO_EM_HORAS,
  parseTimeInput,
  serieCabeNoDia,
} from "@/shared/time-input";
import { BottomSheet, Button, Checkbox, TextField, TimePicker } from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

/** "1ª dose", "2ª dose"… — dentro do popup há largura pra escrever por extenso. */
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

/**
 * Os conteúdos que o popup pode estar mostrando. `relogioDaSerie` é o mesmo relógio, mas voltando
 * para a série em vez de para a lista — o destino do "voltar" muda com de onde ele foi aberto.
 */
type ModoDoPopup =
  | { tipo: "lista" }
  | { tipo: "relogio"; index: number }
  | { tipo: "serie" }
  | { tipo: "relogioDaSerie" };

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
 * é pior do que exigir a resposta.
 *
 * O popup tem dois estados: a lista dos horários e o relógio de um deles. O relógio ocupa o
 * **mesmo** popup em vez de abrir outro por cima — modal dentro de modal empilha duas camadas de
 * fundo escurecido e o botão físico de voltar deixa de ter um destino óbvio.
 */
export function SeletorDeHorarios({
  label,
  values,
  onChange,
  duplicateIndexes = [],
  variacao,
}: SeletorDeHorariosProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  /**
   * O popup tem um conteúdo por vez, e é sempre o mesmo popup. Guardar isso numa união em vez de
   * três booleanos independentes é o que impede o estado impossível — a série aberta por cima do
   * relógio, por exemplo — de existir.
   */
  const [modo, setModo] = useState<ModoDoPopup>({ tipo: "lista" });
  /**
   * O horário girado na roda, ainda **não** gravado. Enquanto for `null`, ninguém tocou no
   * relógio — e a posição em que ele abriu não pode virar resposta por um toque em "Confirmar".
   */
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [intervaloInput, setIntervaloInput] = useState("");
  const [primeiroDaSerie, setPrimeiroDaSerie] = useState<string | null>(null);

  const isEmpty = values.every((value) => value.at.length === 0);
  const pendentes = values.filter((value) => parseTimeInput(value.at) === null).length;

  function abrirRelogio(index: number) {
    setRascunho(null);
    setModo({ tipo: "relogio", index });
  }

  function confirmarRelogio(index: number) {
    if (rascunho === null) return;
    onChange(values.map((current, i) => (i === index ? { ...current, at: rascunho } : current)));
    setRascunho(null);
    setModo({ tipo: "lista" });
  }

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
   * Os horários são de um mesmo dia, então "1ª" e "2ª" não são escolha de quem preenche: quem
   * decide a ordem é o relógio. Escolher 04:00 na primeira linha e 02:00 na segunda descreve o
   * mesmo dia que a ordem inversa — e era isso que acontecia calado, porque a posologia já era
   * ordenada na hora de salvar enquanto a tela continuava mostrando a ordem digitada.
   *
   * Ordenar ao fechar deixa o reordenamento **visível**: a pessoa fecha o popup e vê as fichinhas
   * na ordem em que o dia vai acontecer. A dose de cada horário viaja junto, senão trocar a ordem
   * trocaria em silêncio quanto se toma de manhã e à noite — que é o erro que este campo existe
   * pra evitar. Horário em branco vai pro fim, pra linha vazia não pular debaixo do dedo.
   */
  function handleClose() {
    const preenchidos = values
      .filter((value) => parseTimeInput(value.at) !== null)
      .sort((a, b) => a.at.localeCompare(b.at));
    const pendentesVazios = values.filter((value) => parseTimeInput(value.at) === null);
    onChange([...preenchidos, ...pendentesVazios]);
    setSheetOpen(false);
  }

  /**
   * Fechar pelo fundo escurecido ou pelo botão físico de voltar. Fora da lista, o destino óbvio é
   * o conteúdo de trás — e não a tela de cadastro, que faria a pessoa perder os horários que ela
   * já tinha escolhido nas outras linhas.
   */
  function handleRequestClose() {
    if (modo.tipo === "relogio" || modo.tipo === "serie") {
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
    if (modo.tipo === "relogio") {
      return values.length > 1 ? `${ORDINALS[modo.index]} dose` : label;
    }
    return label;
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
            // Horário em branco não pode virar ficha preenchida: quem bate o olho leria uma
            // hora resolvida e sairia da tela achando que terminou.
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

      <BottomSheet visible={isSheetOpen} onClose={handleRequestClose} title={tituloDoPopup()}>
        {modo.tipo === "relogio" || modo.tipo === "relogioDaSerie" ? (
          <View style={styles.sheetBody}>
            <TimePicker
              // A roda é remontada a cada destino: sem a chave, ela reaproveitaria a posição da
              // linha anterior e abriria no horário do vizinho.
              key={modo.tipo === "relogio" ? modo.index : "serie"}
              initialValue={
                modo.tipo === "relogio" ? parseTimeInput(values[modo.index].at) : primeiroDaSerie
              }
              onChange={setRascunho}
            />
            <View style={styles.linhaDeAcoes}>
              <Button
                label="Cancelar"
                variant="outline"
                style={styles.acaoDaLinha}
                onPress={handleRequestClose}
              />
              {/* Desabilitado enquanto ninguém girar: a posição em que o relógio abre é ponto de
                  partida, não resposta, e confirmá-la sem tocar seria o mesmo horário sugerido
                  que este formulário recusa desde o começo. */}
              <Button
                label="Confirmar"
                style={styles.acaoDaLinha}
                disabled={rascunho === null}
                onPress={() => {
                  if (modo.tipo === "relogio") {
                    confirmarRelogio(modo.index);
                    return;
                  }
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
              <Text style={styles.fieldLabel}>PRIMEIRO HORÁRIO</Text>
              <Pressable
                style={styles.botaoDeHorario}
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

            {/* A lista inteira antes de aplicar: é ela que deixa a virada da madrugada visível,
                que é justamente o que a conta de cabeça erra. */}
            {previaDaSerie !== null ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>FICARIA ASSIM</Text>
                <View style={styles.timeChipRow}>
                  {previaDaSerie.map((horario, index) => (
                    <View key={index} style={styles.timeChip}>
                      <Text style={styles.timeChipText}>{horario}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.linhaDeAcoes}>
              <Button
                label="Cancelar"
                variant="outline"
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
                  <Pressable
                    style={[
                      styles.botaoDeHorario,
                      (duplicateIndexes.includes(index) || parseTimeInput(value.at) === null) &&
                        styles.botaoDeHorarioErro,
                    ]}
                    onPress={() => abrirRelogio(index)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      parseTimeInput(value.at) === null
                        ? "Escolher horário"
                        : `Alterar horário ${value.at}`
                    }>
                    <Text
                      style={[
                        styles.botaoDeHorarioTexto,
                        parseTimeInput(value.at) === null && styles.botaoDeHorarioVazio,
                      ]}>
                      {parseTimeInput(value.at) ?? "--:--"}
                    </Text>
                  </Pressable>
                </View>
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

            {/* "De 8 em 8 horas" é como o médico fala, e o formulário só entende horários. Fazer
                a conta pela pessoa não é sugerir: os dois números são dela, e a lista aparece
                inteira antes de valer. Com um horário só não há intervalo nenhum a calcular. */}
            {values.length > 1 ? (
              <Button label="Preencher de X em X horas" variant="text" onPress={abrirSerie} />
            ) : null}

            {/* O popup fecha mesmo incompleto — prender a pessoa aqui é pior que deixá-la voltar
                depois. Quem cobra o que falta é o resumo lá fora e o rodapé da tela. */}
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
