import { generateDoseSchedules, type SchedulablePrescription } from "./generate-dose-schedules";

/**
 * Os horários de **hoje** que o cadastro vai descartar por já terem passado.
 *
 * A regra do app e que dose vencida nao vira compromisso: o controle de alerta e de estoque comeca
 * no instante do cadastro, e o ciclo normal vale a partir de amanha. Cobrar confirmacao de algo que
 * a pessoa nao tinha como cumprir seria pior.
 *
 * O que não pode é acontecer calado. Quem digita três horários e salva precisa saber que dois
 * deles não valem para hoje, senão sai da tela achando que agendou o dia inteiro. Esta função
 * existe só para a tela poder dizer isso - a geração em si continua sendo do
 * `generateDoseSchedules`, e as duas leem a mesma prescrição para não divergirem.
 *
 * Devolve os horários em `HH:MM`, na ordem do dia. Lista vazia = nada a avisar.
 */
export function dosesDeHojeJaPassadas(
  prescription: SchedulablePrescription,
  now: Date,
): string[] {
  const inicioDeHoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inicioDeAmanha = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Gerar o dia inteiro e tirar o que o cadastro real vai gravar dá exatamente a diferença, sem
  // reimplementar as regras de dia de tomar (semanal, ciclo, vigência) - que é onde moram os
  // casos difíceis e onde duas implementações divergiriam em silêncio.
  const doDiaInteiro = generateDoseSchedules({
    prescription,
    from: inicioDeHoje,
    until: inicioDeAmanha,
  });

  const aindaVaoAcontecer = new Set(
    generateDoseSchedules({ prescription, from: now, until: inicioDeAmanha }).map(
      (dose) => dose.scheduledFor,
    ),
  );

  return doDiaInteiro
    .filter((dose) => !aindaVaoAcontecer.has(dose.scheduledFor))
    .map((dose) => {
      const at = new Date(dose.scheduledFor);
      const p = (value: number) => String(value).padStart(2, "0");
      return `${p(at.getHours())}:${p(at.getMinutes())}`;
    });
}
