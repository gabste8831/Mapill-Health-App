import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./TimePicker.styles";

/** Onde o mostrador abre sem resposta. Não é valor gravado: `onChange` só dispara por interação. */
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
 * Mostrador redondo nativo do Android (Material 3). É Jetpack Compose: `.ios.tsx` usa a roda do
 * SwiftUI e `.web.tsx` mantém campos digitáveis para o preview.
 *
 * Cuidado ao mexer: `variant="input"` do `@expo/ui` é aceito pelo TypeScript mas ignorado no
 * caminho da hora. `DatePickerView.kt` só lê `props.variant` no caminho da data.
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="hourAndMinute"
          // Sem AM/PM, "20" é 20: é onde o erro seria caro, tomar às 20:00 o que era das 08:00.
          is24Hour
          // `showVariantToggle` deixa alternar para digitação dentro do popup.
          variant="picker"
          showVariantToggle
          initialDate={paraData(initialValue ?? HORARIO_NEUTRO).toISOString()}
          // `color` sozinho pinta só parte dos elementos: o resto herda o acento do Material You
          // do aparelho. Cada peça precisa ser nomeada em `elementColors`.
          color={cores.primary}
          elementColors={{
            containerColor: cores.surfaceContainerLowest,
            clockDialColor: cores.surfaceContainer,
            selectorColor: cores.primary,
            clockDialSelectedContentColor: cores.onPrimary,
            clockDialUnselectedContentColor: cores.onSurface,
            timeSelectorSelectedContainerColor: cores.primaryContainer,
            timeSelectorSelectedContentColor: cores.onPrimary,
            timeSelectorUnselectedContainerColor: cores.surfaceContainer,
            timeSelectorUnselectedContentColor: cores.onSurface,
          }}
          onDateSelected={(data) => onChange(paraHorario(data))}
        />
      </Host>
    </View>
  );
}
