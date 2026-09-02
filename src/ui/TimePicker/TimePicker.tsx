import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./TimePicker.styles";

/**
 * Onde o mostrador começa quando ainda não há resposta. **Não é sugestão**: a posição inicial de um
 * relógio não é um campo preenchido, e nada é gravado enquanto a pessoa não confirmar. Quem garante
 * isso é quem usa este componente — o `onChange` só dispara quando alguém mexe.
 */
const HORARIO_NEUTRO = "08:00";

export type TimePickerProps = {
  /** "HH:MM" em que o mostrador abre. */
  initialValue: string | null;
  /** Só é chamado por interação de quem está usando, nunca ao montar. */
  onChange: (value: string) => void;
};

function paraData(horario: string): Date {
  const [horas, minutos] = horario.split(":");
  const data = new Date();
  data.setHours(Number(horas), Number(minutos), 0, 0);
  return data;
}

function paraHorario(data: Date): string {
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

/**
 * O mostrador redondo nativo do Android (Material 3), atrás do ícone de relógio.
 *
 * ## Por que ele voltou (02/09)
 *
 * Este componente já foi o mostrador nativo, virou dois campos digitáveis escritos à mão, e agora
 * volta a ser o mostrador. Vale registrar por quê, porque a ida e a volta **não** se contradizem —
 * o que mudou foi o contexto ao redor.
 *
 * Quando o `TimePicker` era o **único** caminho para escolher horário, o mostrador era um problema
 * real: girar não é gesto óbvio, e o relógio analógico esconde a distinção entre manhã e noite —
 * que é exatamente onde o erro é caro, tomar às 20:00 o que era das 08:00. Foi por isso que a
 * revisão em aparelho pediu digitação duas vezes, e o componente foi reescrito à mão (o
 * `variant="input"` do `@expo/ui` não funciona: `DatePickerView.kt` só lê `props.variant` no
 * caminho da *data*, e ignora no da hora).
 *
 * Hoje o contexto é outro. O `TimeField` tem **o campo de digitação como caminho principal** — a
 * pessoa digita `0800` direto, com máscara que recusa o impossível — e o relógio mora num ícone ao
 * lado, para quem preferir. Como alternativa, e não como obrigação, o mostrador nativo é o certo:
 * é o componente que o sistema oferece, que a pessoa já viu em outros aplicativos, e ninguém é
 * forçado a girar nada.
 *
 * A objeção antiga continua verdadeira sobre o que ela falava; ela só não fala mais deste caso.
 *
 * É componente do Jetpack Compose, ou seja, **Android**. Os irmãos: `.ios.tsx` usa a roda do
 * SwiftUI, e `.web.tsx` mantém os campos digitáveis para o preview do navegador.
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="hourAndMinute"
          /**
           * `is24Hour` apaga a maior armadilha do mostrador: sem AM/PM, "20" é 20. A confusão entre
           * manhã e noite era metade do argumento contra este componente, e ela some com o formato
           * de 24 horas.
           */
          is24Hour
          /**
           * `picker` é o mostrador redondo, e é o padrão do componente — declarado à vista porque é
           * justamente a escolha que este arquivo existe para registrar.
           *
           * `showVariantToggle` mantém o botão que alterna para digitação dentro do próprio popup:
           * quem abriu o relógio por engano não fica preso nele.
           */
          variant="picker"
          showVariantToggle
          initialDate={paraData(initialValue ?? HORARIO_NEUTRO).toISOString()}
          /**
           * `elementColors` em vez de só `color`.
           *
           * `color` pinta um subconjunto dos elementos, e o resto herda o acento do tema do
           * sistema — foi o que fez o verde do Material You aparecer no aparelho, mesmo caso da
           * pílula das abas resolvido em 23/08. Nomear cada peça é o que garante que o popup seja
           * do Mapill em qualquer aparelho, e o SDK 57 passou a permitir isso.
           */
          color={colors.primary}
          elementColors={{
            containerColor: colors.surfaceContainerLowest,
            clockDialColor: colors.surfaceContainer,
            selectorColor: colors.primary,
            clockDialSelectedContentColor: colors.onPrimary,
            clockDialUnselectedContentColor: colors.onSurface,
            timeSelectorSelectedContainerColor: colors.primaryContainer,
            timeSelectorSelectedContentColor: colors.onPrimary,
            timeSelectorUnselectedContainerColor: colors.surfaceContainer,
            timeSelectorUnselectedContentColor: colors.onSurface,
          }}
          onDateSelected={(data) => onChange(paraHorario(data))}
        />
      </Host>
    </View>
  );
}
