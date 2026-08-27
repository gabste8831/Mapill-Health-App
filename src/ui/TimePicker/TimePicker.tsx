import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./TimePicker.styles";

/**
 * Onde a roda começa quando ainda não há resposta. **Não é sugestão**: a posição inicial de um
 * relógio não é um campo preenchido, e nada é gravado enquanto a pessoa não confirmar. Quem
 * garante isso é quem usa este componente — o `onChange` só dispara quando alguém gira.
 */
const HORARIO_NEUTRO = "08:00";

export type TimePickerProps = {
  /** "HH:MM" em que a roda abre. */
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
 * Seletor nativo do Android (Material 3) para escolher hora e minuto.
 *
 * Abre em **`variant="input"`**, os dois campos numéricos, e não no mostrador analógico. A roda
 * funcionava, mas a revisão em aparelho de 26/08 mostrou o custo dela: girar não é gesto óbvio, e
 * o mostrador esconde a distinção entre manhã e noite — que é exatamente onde o erro é caro, tomar
 * às 20:00 o que era das 08:00. Em modo digitação com `is24Hour`, "20" é 20 e não há AM/PM a
 * interpretar.
 *
 * `showVariantToggle` fica ligado: o botão de alternar para o relógio continua ali, então quem
 * prefere girar não perde nada — a mudança é só qual dos dois **abre primeiro**.
 *
 * É componente do Jetpack Compose, ou seja, **Android**. O irmão `.web.tsx` mantém o preview do
 * navegador funcionando com o campo mascarado de sempre (§5.1 do plano: web é vitrine).
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="hourAndMinute"
          variant="input"
          showVariantToggle
          is24Hour
          color={colors.primary}
          // `color` sozinho pinta só parte dos elementos, e o resto herdava o acento do tema do
          // sistema — o verde que apareceu no aparelho, mesmo caso da pílula das abas resolvido em
          // 23/08. Aqui cada peça é dita explicitamente, então o seletor é do app e não do celular.
          elementColors={{
            containerColor: colors.surfaceContainerLowest,
            clockDialColor: colors.surfaceContainerLow,
            selectorColor: colors.primary,
            clockDialSelectedContentColor: colors.onPrimary,
            clockDialUnselectedContentColor: colors.onSurface,
            timeSelectorSelectedContainerColor: colors.primary,
            timeSelectorSelectedContentColor: colors.onPrimary,
            timeSelectorUnselectedContainerColor: colors.surfaceContainerLow,
            timeSelectorUnselectedContentColor: colors.onSurface,
            periodSelectorBorderColor: colors.outlineVariant,
            periodSelectorSelectedContainerColor: colors.primary,
            periodSelectorSelectedContentColor: colors.onPrimary,
            periodSelectorUnselectedContentColor: colors.onSurfaceVariant,
          }}
          initialDate={paraData(initialValue ?? HORARIO_NEUTRO).toISOString()}
          onDateSelected={(data) => onChange(paraHorario(data))}
        />
      </Host>
    </View>
  );
}
