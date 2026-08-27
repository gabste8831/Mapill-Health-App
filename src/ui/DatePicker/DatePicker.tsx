import { DateTimePicker, Host } from "@expo/ui/jetpack-compose";
import { View } from "react-native";

import { colors } from "@/shared/theme";
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
 * Calendário nativo do Android (Material 3) para escolher uma data.
 *
 * Existe porque data digitada aceita o que não existe: 31 de fevereiro, 30/02/2026, o ano com três
 * dígitos que ficou pela metade. Cada um desses vira erro depois do submit, longe do campo — e no
 * meio disso a pessoa não sabe se errou o dia ou o formato. No calendário o dia impossível
 * simplesmente não está lá para ser tocado, que é prevenção de erro em vez de mensagem de erro.
 *
 * `selectableDates` fecha o resto: data de nascimento não é no futuro, compromisso não é no
 * passado. O limite entra aqui e não numa validação à parte, senão as duas divergem.
 *
 * É componente do Jetpack Compose, ou seja, **Android**. Os irmãos `.ios.tsx` e `.web.tsx` cobrem
 * as outras plataformas.
 */
export function DatePicker({ initialValue, onChange, minimo, maximo }: DatePickerProps) {
  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="date"
          variant="picker"
          color={colors.primary}
          // Mesmo motivo do TimePicker: sem isto, parte dos elementos herda o acento do tema do
          // sistema, e o calendário aparece com a cor do celular em vez da do app.
          elementColors={{
            containerColor: colors.surfaceContainerLowest,
            titleContentColor: colors.onSurfaceVariant,
            headlineContentColor: colors.onSurface,
            weekdayContentColor: colors.onSurfaceVariant,
            subheadContentColor: colors.onSurfaceVariant,
            navigationContentColor: colors.onSurfaceVariant,
            dayContentColor: colors.onSurface,
            disabledDayContentColor: colors.outline,
            selectedDayContainerColor: colors.primary,
            selectedDayContentColor: colors.onPrimary,
            todayContentColor: colors.primary,
            todayDateBorderColor: colors.primary,
            yearContentColor: colors.onSurface,
            selectedYearContainerColor: colors.primary,
            selectedYearContentColor: colors.onPrimary,
            currentYearContentColor: colors.primary,
            dividerColor: colors.outlineVariant,
          }}
          selectableDates={
            minimo !== undefined || maximo !== undefined
              ? { start: minimo, end: maximo }
              : undefined
          }
          initialDate={paraData(initialValue ?? paraIsoDay(new Date())).toISOString()}
          onDateSelected={(data) => onChange(paraIsoDay(data))}
        />
      </Host>
    </View>
  );
}
