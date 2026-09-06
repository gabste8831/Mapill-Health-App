import type { IntakeStatus } from "../entities/intake-log";

/** Uma dose do período, como o relatório de adesão a carrega. */
export type DoseParaDia = {
  scheduledFor: string;
  latestStatus: IntakeStatus | null;
};

/** Um dia do recorte, com a adesão dele. */
export type AdesaoDeUmDia = {
  /** `YYYY-MM-DD` local — a chave que agrupa as doses do dia. */
  dia: string;
  previstas: number;
  confirmadas: number;
  /** `null` quando nenhuma dose venceu no dia: ausência de dado não é adesão zero. */
  taxa: number | null;
  ehHoje: boolean;
};

export type AdesaoPorDiaInput = {
  doses: DoseParaDia[];
  agora: Date;
  /** Quantos dias listar, terminando em hoje. */
  dias: number;
};

/** `Date` → `YYYY-MM-DD` no fuso local. Não usa `toISOString`, que converteria para UTC. */
function diaLocal(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/**
 * A adesão **dia a dia**, e não só a média do período.
 *
 * ## Por que ela é uma pergunta diferente da taxa geral
 *
 * "86% nos últimos 7 dias" descreve o conjunto e esconde a forma dele: seis dias perfeitos e um
 * zerado dão quase o mesmo número que sete dias irregulares, e as duas situações pedem conversas
 * clínicas diferentes. Quem olha o próprio tratamento quer saber **qual dia** falhou — é isso que
 * liga o número a um acontecimento ("na quarta eu viajei") em vez de deixá-lo como um veredito.
 *
 * O mini-gráfico da Home já mostra isso em barras, mas barra não se lê como número: dá para ver que
 * um dia foi pior, não *quanto* pior.
 *
 * ## O que conta
 *
 * Só as doses cujo horário **já passou** — a mesma regra da taxa geral (RN20). A dose das 22h não
 * pode contar contra alguém às 15h, e um dia inteiro no futuro não tem taxa, tem ausência de dado.
 *
 * Dias sem dose agendada vêm com `taxa: null`, e não com zero: quem não tinha o que tomar não
 * falhou em nada.
 */
export function adesaoPorDia(input: AdesaoPorDiaInput): AdesaoDeUmDia[] {
  const { doses, agora, dias } = input;

  const previstasPorDia = new Map<string, number>();
  const confirmadasPorDia = new Map<string, number>();

  for (const dose of doses) {
    const quando = new Date(dose.scheduledFor);
    // Ainda não venceu: não entra em nenhum dos dois lados da conta.
    if (quando > agora) continue;

    const chave = diaLocal(quando);
    previstasPorDia.set(chave, (previstasPorDia.get(chave) ?? 0) + 1);
    if (dose.latestStatus === "confirmed") {
      confirmadasPorDia.set(chave, (confirmadasPorDia.get(chave) ?? 0) + 1);
    }
  }

  const hoje = diaLocal(agora);
  const resultado: AdesaoDeUmDia[] = [];

  // Do mais antigo para o mais recente: é a ordem em que se lê uma sequência de dias, e a mesma do
  // gráfico da Home.
  for (let recuo = dias - 1; recuo >= 0; recuo -= 1) {
    const data = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - recuo);
    const chave = diaLocal(data);
    const previstas = previstasPorDia.get(chave) ?? 0;
    const confirmadas = confirmadasPorDia.get(chave) ?? 0;

    resultado.push({
      dia: chave,
      previstas,
      confirmadas,
      taxa: previstas === 0 ? null : confirmadas / previstas,
      ehHoje: chave === hoje,
    });
  }

  return resultado;
}
