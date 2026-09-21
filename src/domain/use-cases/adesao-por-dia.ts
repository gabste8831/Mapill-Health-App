import type { IntakeStatus } from "../entities/intake-log";

/** Uma dose do período, como o relatório de adesão a carrega. */
export type DoseParaDia = {
  scheduledFor: string;
  latestStatus: IntakeStatus | null;
};

/** Um dia do recorte, com a adesão dele. */
export type AdesaoDeUmDia = {
  /** `YYYY-MM-DD` local - a chave que agrupa as doses do dia. */
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
 * A adesao dia a dia, e nao so a media do periodo.
 *
 * "86% em 7 dias" esconde a forma do conjunto: seis dias perfeitos e um zerado dao quase o mesmo
 * numero que sete irregulares, e as duas situacoes pedem conversas clinicas diferentes.
 *
 * Conta todas as doses do dia, vencidas ou nao, e e aqui que difere da taxa geral, que olha so o
 * que venceu. Um dia com duas doses e uma tomada esta pela metade, mesmo que a segunda venca as
 * 22h. Contando so as vencidas, a barra do topo da Home marcava 50% e o grafico logo abaixo 100%,
 * no mesmo dia.
 *
 * Dias inteiramente no futuro seguem sem taxa. Dias sem dose vem com `null`, e nao zero: quem nao
 * tinha o que tomar nao falhou em nada.
 */
export function adesaoPorDia(input: AdesaoPorDiaInput): AdesaoDeUmDia[] {
  const { doses, agora, dias } = input;

  const previstasPorDia = new Map<string, number>();
  const confirmadasPorDia = new Map<string, number>();

  const hojeLocal = diaLocal(agora);

  for (const dose of doses) {
    const quando = new Date(dose.scheduledFor);
    const chave = diaLocal(quando);
    /**
     * Dose de um dia **futuro** fica de fora; dose de hoje que ainda não venceu, não.
     *
     * A distinção é o que faz o gráfico concordar com a barra da Home: hoje é um dia em andamento e
     * se mede inteiro (uma de duas doses = 50%), enquanto amanhã ainda não começou e não tem taxa
     * nenhuma a mostrar.
     */
    if (quando > agora && chave !== hojeLocal) continue;
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
