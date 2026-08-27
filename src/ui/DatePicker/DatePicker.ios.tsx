import { DatePicker as SwiftUIDatePicker, Host } from "@expo/ui/swift-ui";
import { useState } from "react";
import { View } from "react-native";

import { styles } from "./DatePicker.styles";

import type { DatePickerProps } from "./DatePicker";

/** `2026-08-27` → data local à meia-noite. `new Date("...")` leria como UTC e erraria o dia. */
function paraData(isoDay: string): Date {
  const [ano, mes, dia] = isoDay.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function paraIsoDay(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/**
 * Calendário nativo do iOS. Mesmo contrato do Android, componente diferente: lá é Jetpack Compose,
 * aqui é SwiftUI, e as duas APIs não se parecem — o iOS recebe a data por `selection` (controlada,
 * daí o estado local) e devolve por `onDateChange`, enquanto o Android recebe `initialDate` em ISO.
 *
 * Os limites de `minimo`/`maximo` não têm equivalente direto nesta ponte, então a data fora da
 * faixa continua escolhível aqui e é a validação da tela que recusa — a mesma que já existia antes
 * de qualquer calendário. iOS segue **compilável, não verificado**: nada disso vira promessa até
 * existir um build.
 */
export function DatePicker({ initialValue, onChange }: DatePickerProps) {
  const [selecionado, setSelecionado] = useState(() =>
    paraData(initialValue ?? paraIsoDay(new Date())),
  );

  return (
    <View style={styles.container}>
      <Host matchContents style={styles.host}>
        <SwiftUIDatePicker
          displayedComponents={["date"]}
          selection={selecionado}
          onDateChange={(data) => {
            setSelecionado(data);
            onChange(paraIsoDay(data));
          }}
        />
      </Host>
    </View>
  );
}
