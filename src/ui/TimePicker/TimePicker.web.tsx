import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./TimePicker.styles";

/**
 * A versão do preview no navegador — dois campos numéricos escritos à mão.
 *
 * O Android usa o mostrador nativo do Material 3 (`TimePicker.tsx`) e o iOS a roda do SwiftUI
 * (`TimePicker.ios.tsx`); os dois são componentes nativos que não existem na web. Sem este irmão o
 * preview quebraria ao abrir qualquer campo de horário — e o preview é o que permite trabalhar
 * layout sem aparelho (§5.1 do plano: web é vitrine, não alvo).
 *
 * Foi o componente principal entre 26/08 e 02/09, quando a digitação era o único caminho. Continua
 * aqui inteiro porque resolve bem o que precisa resolver: em `20` não há AM/PM a interpretar.
 */

/**
 * Onde os campos começam quando ainda não há resposta. **Não é sugestão**: a posição inicial não é
 * um campo preenchido, e nada é gravado enquanto a pessoa não confirmar. Quem garante isso é quem
 * usa este componente — o `onChange` só dispara quando alguém digita.
 */
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

/**
 * Escolha de horário em dois campos numéricos — hora e minuto, em 24 horas.
 *
 * **Escrito à mão, e não com o `DateTimePicker` do `@expo/ui`.** Aquele componente aceita
 * `variant="input"` no TypeScript, mas o Android o ignora para hora: em `DatePickerView.kt`, o
 * `ExpoTimePicker` chama sempre o `TimePicker` do Material 3 (o mostrador redondo) e nunca lê
 * `props.variant` — que só é consultado no caminho da *data*. `showVariantToggle` também não chega
 * lá, e por isso não existia o botão de alternar. As cores funcionavam porque passam por outro
 * caminho (`buildTimePickerColors`), o que fazia o problema parecer build velha quando não era.
 *
 * A revisão em aparelho pediu digitação duas vezes, e a razão é a mesma das duas: girar não é gesto
 * óbvio, e o mostrador esconde a distinção entre manhã e noite — que é exatamente onde o erro é
 * caro, tomar às 20:00 o que era das 08:00. Aqui "20" é 20, sem AM/PM a interpretar.
 *
 * Multiplataforma por consequência: sem dependência nativa, o mesmo arquivo serve Android, iOS e
 * web. Os irmãos `.ios.tsx` e `.web.tsx` continuam existindo para quem prefira o seletor nativo de
 * cada sistema, e o contrato dos três é idêntico.
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  const [horas, minutos] = (initialValue ?? HORARIO_NEUTRO).split(":");
  const [horaTexto, setHoraTexto] = useState(horas);
  const [minutoTexto, setMinutoTexto] = useState(minutos);
  /** Qual campo está em foco, só para desenhar a moldura de destaque. */
  const [emFoco, setEmFoco] = useState<"hora" | "minuto" | null>(null);

  /**
   * Enquanto digita, o texto vale como está — apagar para escrever de novo é o gesto mais comum, e
   * corrigir a cada tecla impediria o campo de ficar vazio no meio do caminho. O valor é publicado
   * já normalizado, então quem ouve nunca recebe `"7:5"`.
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
            placeholderTextColor={colors.onSurfaceVariant}
          />
          <Text style={styles.rotulo}>HORA</Text>
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
            placeholderTextColor={colors.onSurfaceVariant}
          />
          <Text style={styles.rotulo}>MINUTO</Text>
        </View>
      </View>

      {/* Dito uma vez, embaixo: sem AM/PM na tela, é a única coisa que explica por que "20" basta
          para as oito da noite. */}
      <Text style={styles.ajuda}>Formato de 24 horas — 20:00 é oito da noite.</Text>
    </View>
  );
}
