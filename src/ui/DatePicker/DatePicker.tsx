import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { useCores } from "@/shared/theme";
import { styles } from "./DatePicker.styles";

export type DatePickerProps = {
  /** `YYYY-MM-DD` em que o calendário abre, ou hoje quando ainda não há resposta. */
  initialValue: string | null;
  /** Só é chamado por interação de quem está usando, nunca ao montar. */
  onChange: (isoDay: string) => void;
  /** Limites do que pode ser escolhido. Fora deles o dia nasce apagado, em vez de dar erro depois. */
  minimo?: Date;
  maximo?: Date;
};

/**
 * Meia-noite UTC, que é como o calendário nativo fala de um dia. Tem que casar com a volta em
 * `isoDayDoNativo`: montar a data no fuso local abre o calendário na véspera a leste de Greenwich.
 */
function paraDataUtc(isoDay: string): Date {
  const [ano, mes, dia] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function paraIsoDay(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/**
 * O `DateTimePicker` do Material devolve o dia escolhido como meia-noite UTC. Ler com `getDate` e
 * companhia, que são do fuso local, gravava a véspera no Brasil: escolher 10 virava 9.
 */
function isoDayDoNativo(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getUTCFullYear()}-${p(data.getUTCMonth() + 1)}-${p(data.getUTCDate())}`;
}

/**
 * Calendário nativo do Android (Material 3). É Jetpack Compose: os irmãos `.ios.tsx` e `.web.tsx`
 * cobrem as outras plataformas.
 *
 * O limite de datas entra por `selectableDates` e não numa validação à parte, senão as duas divergem.
 */
export function DatePicker({ initialValue, onChange, minimo, maximo }: DatePickerProps) {
  const cores = useCores();

  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="date"
          variant="picker"
          color={cores.primary}
          // Sem isto parte dos elementos herda o acento do Material You do aparelho.
          elementColors={{
            containerColor: cores.surfaceContainerLowest,
            titleContentColor: cores.onSurfaceVariant,
            headlineContentColor: cores.onSurface,
            weekdayContentColor: cores.onSurfaceVariant,
            subheadContentColor: cores.onSurfaceVariant,
            navigationContentColor: cores.onSurfaceVariant,
            dayContentColor: cores.onSurface,
            disabledDayContentColor: cores.outline,
            selectedDayContainerColor: cores.primary,
            selectedDayContentColor: cores.onPrimary,
            todayContentColor: cores.primary,
            todayDateBorderColor: cores.primary,
            yearContentColor: cores.onSurface,
            selectedYearContainerColor: cores.primary,
            selectedYearContentColor: cores.onPrimary,
            currentYearContentColor: cores.primary,
            dividerColor: cores.outlineVariant,
          }}
          selectableDates={
            minimo !== undefined || maximo !== undefined
              ? { start: minimo, end: maximo }
              : undefined
          }
          initialDate={paraDataUtc(initialValue ?? paraIsoDay(new Date())).toISOString()}
          onDateSelected={(data) => onChange(isoDayDoNativo(data))}
        />
      </Host>
    </View>
  );
}
