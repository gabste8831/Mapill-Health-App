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
 * `2026-08-27` → meia-noite **UTC**, que é como o calendário nativo fala de um dia.
 *
 * A ida tem que casar com a volta (ver `isoDayDoNativo`). Construir a data no fuso local e
 * converter com `toISOString` dava 03:00Z no Brasil — o calendário abria no dia certo por sorte,
 * porque três horas não atravessam a meia-noite para trás. A leste de Greenwich a mesma conta cai
 * no dia anterior, e o calendário abriria na véspera do que está gravado.
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
 * O dia que o calendário nativo devolve, lido em **UTC**.
 *
 * ## O defeito que isto conserta
 *
 * Escolher 10 gravava 9. O `DateTimePicker` do Material devolve o dia escolhido como meia-noite
 * **UTC**, e não como meia-noite local — e a leitura anterior usava `getFullYear`/`getMonth`/
 * `getDate`, que são os campos do fuso de quem está usando. No Brasil (UTC-3), meia-noite UTC do
 * dia 10 é 21h do dia **9**: o app gravava a véspera de tudo o que se escolhia no calendário.
 *
 * O erro é invisível ao norte de Greenwich e sistemático a oeste dele, que é onde este app vive.
 * E ele não é cosmético: acerta a validade da receita, a data do compromisso e o primeiro dia do
 * ciclo — datas de que dependem os avisos.
 *
 * Ler os campos UTC devolve o dia que a pessoa tocou, sem depender do fuso do aparelho.
 */
function isoDayDoNativo(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getUTCFullYear()}-${p(data.getUTCMonth() + 1)}-${p(data.getUTCDate())}`;
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
  const cores = useCores();

  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <DateTimePicker
          displayedComponents="date"
          variant="picker"
          color={cores.primary}
          // Mesmo motivo do TimePicker: sem isto, parte dos elementos herda o acento do tema do
          // sistema, e o calendário aparece com a cor do celular em vez da do app.
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
