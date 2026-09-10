import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./TimePicker.styles";

/**
 * Versão do preview no navegador: os irmãos `.tsx` e `.ios.tsx` usam componentes nativos que não
 * existem na web, e sem este arquivo o preview quebra ao abrir qualquer campo de horário.
 */

/** Onde os campos abrem sem resposta. Não é valor gravado: `onChange` só dispara por digitação. */
const HORARIO_NEUTRO = "08:00";

export type TimePickerProps = {
  /** "HH:MM" em que o seletor abre. */
  initialValue: string | null;
  /** Só é chamado por interação de quem está usando, nunca ao montar. */
  onChange: (value: string) => void;
};

/** Limita ao intervalo do campo. Digitar 99 em horas vira 23, e não um erro a ser lido. */
function limitar(valor: number, maximo: number): number {
  if (Number.isNaN(valor)) return 0;
  return Math.min(Math.max(valor, 0), maximo);
}

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

/** Hora e minuto em 24 horas, escrito à mão: sem dependência nativa, roda no navegador. */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const [horas, minutos] = (initialValue ?? HORARIO_NEUTRO).split(":");
  const [horaTexto, setHoraTexto] = useState(horas);
  const [minutoTexto, setMinutoTexto] = useState(minutos);
  /** Qual campo está em foco, só para desenhar a moldura de destaque. */
  const [emFoco, setEmFoco] = useState<"hora" | "minuto" | null>(null);

  /**
   * O texto do campo fica cru enquanto digita, para poder ficar vazio no meio do caminho. Quem
   * ouve nunca recebe `"7:5"`: o valor sai normalizado daqui.
   */
  function publicar(hora: string, minuto: string) {
    const h = limitar(Number(hora), 23);
    const m = limitar(Number(minuto), 59);
    onChange(`${doisDigitos(h)}:${doisDigitos(m)}`);
  }

  function handleHora(raw: string) {
    const digitos = raw.replace(/\D/g, "").slice(0, 2);
    setHoraTexto(digitos);
    publicar(digitos, minutoTexto);
  }

  function handleMinuto(raw: string) {
    const digitos = raw.replace(/\D/g, "").slice(0, 2);
    setMinutoTexto(digitos);
    publicar(horaTexto, digitos);
  }

  /** No blur o campo assume a forma final: `7` vira `07`, vazio vira `00`, `99` vira o teto. */
  function normalizarHora() {
    setEmFoco(null);
    setHoraTexto(doisDigitos(limitar(Number(horaTexto), 23)));
  }

  function normalizarMinuto() {
    setEmFoco(null);
    setMinutoTexto(doisDigitos(limitar(Number(minutoTexto), 59)));
  }

  return (
    <View style={styles.container}>
      <View style={styles.campos}>
        <View style={styles.campo}>
          <TextInput
            style={[styles.entrada, emFoco === "hora" && styles.entradaFocada]}
            value={horaTexto}
            onChangeText={handleHora}
            onFocus={() => setEmFoco("hora")}
            onBlur={normalizarHora}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel="Hora"
            placeholder="00"
            placeholderTextColor={cores.onSurfaceVariant}
          />
          <Text style={styles.rotulo}>Hora</Text>
        </View>

        <Text style={styles.separador}>:</Text>

        <View style={styles.campo}>
          <TextInput
            style={[styles.entrada, emFoco === "minuto" && styles.entradaFocada]}
            value={minutoTexto}
            onChangeText={handleMinuto}
            onFocus={() => setEmFoco("minuto")}
            onBlur={normalizarMinuto}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel="Minuto"
            placeholder="00"
            placeholderTextColor={cores.onSurfaceVariant}
          />
          <Text style={styles.rotulo}>Minuto</Text>
        </View>
      </View>

      <Text style={styles.ajuda}>Formato de 24 horas. 20:00 é oito da noite.</Text>
    </View>
  );
}
