import { generateDoseSchedules, type SchedulablePrescription } from "./generate-dose-schedules";

/** Até onde vale a pena procurar um fim que complete o ciclo. Prazo maior que isso não é "curso". */
const MAX_DIAS_DE_EXTENSAO = 60;

export type DoseFaltanteDoPrazo = {
  /** Quantas doses o prazo entrega, cadastrando agora. */
  planejadas: number;
  /** Quantas ele entregaria se o tratamento tivesse começado no início do primeiro dia. */
  nominais: number;
  /** Data de fim que completaria as `nominais`, em ISO `YYYY-MM-DD`. */
  fimQueCompleta: string;
};

function toIsoDay(date: Date): string {
  const p = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

function parseIsoDay(isoDate: string): Date | null {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Doses que a prescrição entrega entre dois instantes. */
function contar(prescription: SchedulablePrescription, from: Date, fimInclusivo: Date): number {
  const until = new Date(
    fimInclusivo.getFullYear(),
    fimInclusivo.getMonth(),
    fimInclusivo.getDate() + 1,
  );
  return generateDoseSchedules({ prescription, from, until }).length;
}

/**
 * Quantas doses o prazo perde por o tratamento ter sido cadastrado com o dia já em curso — e até
 * quando ele precisaria ir para entregar o tratamento inteiro.
 *
 * O problema que isto resolve: "3 vezes ao dia por 7 dias" é uma prescrição de **21 doses**, mas
 * quem cadastra às 15h já perdeu as duas primeiras de hoje. Terminando na mesma data, o
 * tratamento entrega 19 — e uma pessoa tomando antibiótico encerra o ciclo antes da hora sem
 * nada na tela ter avisado. Em vitamina não muda nada; em antimicrobiano, é o caminho da
 * resistência bacteriana.
 *
 * A função **não decide**: devolve a diferença e a data que a corrigiria, para a tela poder
 * oferecer a escolha. Estender por conta própria sobrescreveria em silêncio a data que a pessoa
 * digitou, que é o erro oposto e igualmente ruim.
 *
 * `null` quando não há o que corrigir: sem prazo (uso contínuo), sem horário ("se necessário"),
 * quando o prazo já entrega o tratamento inteiro, ou quando nem estendendo se completa dentro do
 * limite de busca.
 */
export function doseFaltanteDoPrazo(
  prescription: SchedulablePrescription,
  now: Date,
): DoseFaltanteDoPrazo | null {
  if (prescription.endDate === null) return null;

  const inicio = parseIsoDay(prescription.startDate);
  const fim = parseIsoDay(prescription.endDate);
  if (inicio === null || fim === null) return null;

  // O nominal parte do começo do primeiro dia — é o tratamento como a receita o descreve, sem o
  // recorte de ter sido cadastrado no meio do dia.
  const nominais = contar(prescription, inicio, fim);
  const planejadas = contar(prescription, now, fim);
  if (nominais === 0 || planejadas >= nominais) return null;

  // Um dia de cada vez em vez de calcular: com semana e ciclo, "quantos dias faltam" não é
  // divisão — pode haver pausa no meio, e só o gerador sabe onde.
  for (let dias = 1; dias <= MAX_DIAS_DE_EXTENSAO; dias += 1) {
    const candidato = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() + dias);
    if (contar(prescription, now, candidato) >= nominais) {
      return { planejadas, nominais, fimQueCompleta: toIsoDay(candidato) };
    }
  }

  return null;
}
