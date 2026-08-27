import type { MedicationForm, PosologyUnit } from "@/domain/entities/medication";
import {
  dosesOfSchedule,
  type PosologySchedule,
  type Weekday,
} from "@/domain/entities/prescription";

/**
 * Como forma, unidade e posologia são ditas em português. Fica fora das telas porque cadastro e
 * listagem falam do mesmo remédio: se cada tela tivesse a sua tabela, o que foi cadastrado como
 * "Comprimido ou cápsula" apareceria na lista com outro nome, e nada no código denunciaria.
 */

export const MEDICATION_FORM_LABELS: Record<MedicationForm, string> = {
  tablet: "Comprimido ou cápsula",
  liquid: "Líquido (xarope, solução)",
  drops: "Gotas",
  injection: "Injeção",
  ointment: "Pomada ou creme",
  sublingual: "Sublingual",
  inhaler: "Inalador ou spray",
  patch: "Adesivo",
  sachet: "Sachê ou pó",
  other: "Outra",
};

/** Curto de propósito: é rótulo de ficha, lido em fileira e comparado com os vizinhos. */
export const UNIT_LABELS: Record<PosologyUnit, string> = {
  tablet: "comprimido",
  capsule: "cápsula",
  drop: "gota",
  ml: "ml",
  mg: "mg",
  g: "g",
  IU: "UI",
  application: "aplicação",
  puff: "jato",
  patch: "adesivo",
  sachet: "sachê",
};

/**
 * O plural curto, pro meio de uma frase ("2 comprimidos"). Abreviação de medida não flexiona —
 * "2 mgs" não existe —, então ml, mg, g e UI repetem o singular de propósito.
 */
export const UNIT_PLURALS: Record<PosologyUnit, string> = {
  tablet: "comprimidos",
  capsule: "cápsulas",
  drop: "gotas",
  ml: "ml",
  mg: "mg",
  g: "g",
  IU: "UI",
  application: "aplicações",
  puff: "jatos",
  patch: "adesivos",
  sachet: "sachês",
};

/** 0 = domingo … 6 = sábado, igual ao `Date.getDay()`. */
const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "dom",
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sáb",
};

/** `1.5` → `"1,5"`, `1` → `"1"`. Vírgula porque é o separador decimal que a pessoa digitou. */
export function formatarNumero(value: number): string {
  return String(Number(value.toFixed(3))).replace(".", ",");
}

/** `["a", "b", "c"]` → `"a, b e c"`. */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

/** `1, "tablet"` → `"1 comprimido"`; `2, "tablet"` → `"2 comprimidos"`. */
export function formatarQuantidade(amount: number, unit: PosologyUnit): string {
  const rotulo = amount === 1 ? UNIT_LABELS[unit] : UNIT_PLURALS[unit];
  return `${formatarNumero(amount)} ${rotulo}`;
}

/**
 * Igual, mas para a unidade do estoque, que é `string` no banco e não `PosologyUnit` — ela foi
 * gravada em cadastros antigos e pode não estar na tabela. Desconhecida, sai como está: mostrar o
 * que o paciente gravou é melhor que esconder a quantidade porque o rótulo não bate.
 */
export function formatarQuantidadeLivre(amount: number, unit: string): string {
  if (unit in UNIT_LABELS) return formatarQuantidade(amount, unit as PosologyUnit);
  return `${formatarNumero(amount)} ${unit}`.trim();
}

/**
 * Em quais dias o tratamento cai, sem os horários — o eixo "quando" da posologia. Os horários
 * saem em `horariosDaPosologia` porque a lista mostra os dois em lugares diferentes.
 */
export function resumirFrequencia(schedule: PosologySchedule): string {
  if (schedule.kind === "asNeeded") return "Só quando precisar";
  if (schedule.kind === "daily") return "Todo dia";

  if (schedule.kind === "weekly") {
    if (schedule.weekdays.length === 0) return "Dias da semana";
    // Ordenados pra não sair "qui e seg" só porque foi essa a ordem em que foram tocados.
    const dias = [...schedule.weekdays].sort((a, b) => a - b).map((dia) => WEEKDAY_LABELS[dia]);
    return enumerar(dias);
  }

  // "Dia sim, dia não" é como as pessoas dizem — "1 dia a cada 2" seria a mesma coisa dita de um
  // jeito que ninguém usa.
  if (schedule.activeDays === 1 && schedule.cycleLengthDays === 2) return "Dia sim, dia não";
  if (schedule.activeDays === 1) return `A cada ${schedule.cycleLengthDays} dias`;
  return `${schedule.activeDays} dias a cada ${schedule.cycleLengthDays}`;
}

/** Os horários do dia, já ordenados. Vazio quando a posologia não agenda nada. */
export function horariosDaPosologia(schedule: PosologySchedule): string[] {
  return dosesOfSchedule(schedule)
    .map((dose) => dose.at)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Os horários com a quantidade de cada um — `"08:00 · 10 UI"`.
 *
 * Existe separado de `horariosDaPosologia` porque responde outra pergunta: aquele diz **quando**,
 * este diz **quando e quanto**. Numa lista onde a dose varia de um horário para o outro, a hora
 * sozinha esconde exatamente a informação que faz a pessoa conferir a fichinha — e onde a dose é
 * igual em todos, repetir o número em cada ficha seria ruído, então ele só aparece quando muda.
 */
export function horariosComDose(
  schedule: PosologySchedule,
  doseAmount: number,
  doseUnit: PosologyUnit,
): string[] {
  const doses = dosesOfSchedule(schedule)
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at));
  const variaPorHorario = doses.some(
    (dose) => dose.amount !== null && dose.amount !== doseAmount,
  );
  if (!variaPorHorario) return doses.map((dose) => dose.at);
  return doses.map(
    (dose) => `${dose.at} · ${formatarQuantidade(dose.amount ?? doseAmount, doseUnit)}`,
  );
}

/**
 * A dose de um tratamento em uma linha. Quando os horários têm quantidades diferentes, o número
 * único seria mentira — então diz que varia, e a tela mostra horário a horário.
 */
export function resumirDose(
  doseAmount: number,
  doseUnit: PosologyUnit,
  schedule: PosologySchedule,
): string {
  const doses = dosesOfSchedule(schedule);
  const variaPorHorario = doses.some(
    (dose) => dose.amount !== null && dose.amount !== doseAmount,
  );
  if (variaPorHorario) return `Dose variável (${UNIT_PLURALS[doseUnit]})`;
  return formatarQuantidade(doseAmount, doseUnit);
}
