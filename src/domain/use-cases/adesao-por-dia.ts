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
 * **Todas as doses do dia**, tenham vencido ou não — e é aqui que esta conta difere da taxa geral.
 *
 * A taxa geral olha só o que venceu, porque ela responde "como foi a adesão até agora" sobre um
 * período inteiro. Esta responde outra coisa: "como está **este dia**". E um dia com duas doses em
 * que uma foi tomada está pela metade, não completo — mesmo que a segunda só vença às 22h.
 *
 * A regra anterior contava só as vencidas, e o efeito em aparelho foi o app se contradizer na mesma
 * tela: a barra de progresso do topo da Home marcava 50% (uma de duas doses do dia) e o gráfico
 * logo abaixo marcava 100% (uma de uma dose vencida). Duas barras lado a lado, o mesmo dia, números
 * diferentes — e quem lê não tem como saber em qual acreditar.
 *
 * Dias **inteiramente** no futuro continuam sem taxa: ali não há nem o que ter começado. O que
 * mudou é só o dia em andamento, que agora se mede pelo que ele tem, e não pelo que já passou.
 *
 * Dias sem dose agendada vêm com `taxa: null`, e não com zero: quem não tinha o que tomar não
 * falhou em nada.
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
