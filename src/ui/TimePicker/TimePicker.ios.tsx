import { DatePicker, Host } from "@expo/ui/swift-ui";
import { useState } from "react";
import { View } from "react-native";

import { styles } from "./TimePicker.styles";

import type { TimePickerProps } from "./TimePicker";

/** Mesmo ponto de partida do Android — posição da roda, nunca resposta gravada. */
const HORARIO_NEUTRO = "08:00";

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
 * Relógio nativo do iOS. Mesmo contrato do Android, componente diferente: lá é Jetpack Compose,
 * aqui é SwiftUI, e as duas APIs não se parecem — o iOS recebe a data por `selection` (controlada,
 * daí o estado local) e devolve por `onDateChange`, enquanto o Android recebe `initialDate` em ISO.
 *
 * Existe porque um `import` de `@expo/ui/jetpack-compose` não resolve no iPhone. O TCC é
 * demonstrado em Android, mas deixar um import que quebra em outra plataforma é dívida que não
 * avisa: ela só aparece no primeiro build de iOS, longe de quem a criou.
 */
export function TimePicker({ initialValue, onChange }: TimePickerProps) {
  const [selecionado, setSelecionado] = useState(() =>
    paraData(initialValue ?? HORARIO_NEUTRO),
  );

  return (
    <View style={styles.container}>
      <Host matchContents style={styles.host}>
        <DatePicker
          displayedComponents={["hourAndMinute"]}
          selection={selecionado}
          onDateChange={(data) => {
            setSelecionado(data);
            onChange(paraHorario(data));
          }}
        />
      </Host>
    </View>
  );
}
