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
 * Relógio nativo do Android (Material 3) para escolher hora e minuto.
 *
 * Substitui o campo mascarado por dois motivos que só aparecem no aparelho: digitar "08:00" num
 * teclado numérico custa quatro toques e um deles é o dois-pontos que a máscara insere sozinha
 * (e que a pessoa tenta digitar mesmo assim), e o relógio já é o gesto que quem usa Android
 * conhece de despertador. O próprio componente oferece o botão de alternar para digitação, então
 * quem prefere teclado não perde nada.
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
          variant="picker"
          is24Hour
          color={colors.primary}
          initialDate={paraData(initialValue ?? HORARIO_NEUTRO).toISOString()}
          onDateSelected={(data) => onChange(paraHorario(data))}
        />
      </Host>
    </View>
  );
}
