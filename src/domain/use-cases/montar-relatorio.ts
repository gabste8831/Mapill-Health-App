import type { DoseDoPeriodo, ResumoDeAdesao } from "./resumir-adesao";
import { resumirAdesao } from "./resumir-adesao";

/**
 * Um tratamento como o relatório o descreve — já em português, não na estrutura do banco.
 *
 * As três linhas são o que o médico pergunta: o quê, quanto e quando. A montagem em texto acontece
 * fora daqui (`rotulos-de-medicamento`), porque é a mesma tradução que a lista de remédios usa e
 * duas tabelas de rótulos divergiriam em silêncio.
 */
export type TratamentoDoRelatorio = {
  medicationId: string;
  nome: string;
  /** `"1 comprimido"`, ou `"Dose variável (UI)"` quando muda por horário. */
  dose: string;
  /** `"Todo dia"`, `"Seg, qua e sex"`, `"Dia sim, dia não"`. */
  frequencia: string;
  /** `["08:00", "20:00"]`, ou com a dose quando ela varia. */
  horarios: string[];
};

/** Um compromisso do período, com o desfecho que ficou registrado. */
export type CompromissoDoRelatorio = {
  descricao: string;
  quando: string;
  /** `null` = passou sem resposta. Pela RN01, isso **não** é "faltou". */
  compareceu: boolean | null;
};

/**
 * Quantas doses cada medicamento deixou de tomar, e como.
 *
 * **Contadas, nunca listadas uma a uma.** É a decisão 6.4 aplicada ao papel: a tela de adesão usa
 * cinza em vez de vermelho porque a lista inteira já é de doses perdidas, e colorir cada linha
 * transformaria registro clínico em fileira de repreensões. Num documento que a pessoa entrega na
 * mão de outra, o efeito é maior — quem se envergonha do relatório não o mostra, e um relatório que
 * não se mostra não serve para nada.
 *
 * `puladas` e `semResposta` continuam separadas porque pedem condutas opostas: "decidi não tomar" é
 * uma conversa sobre o tratamento, "esqueci" é uma conversa sobre a rotina.
 */
export type PerdaPorMedicamento = {
  nome: string;
  puladas: number;
  semResposta: number;
};

export type RelatorioInput = {
  doses: DoseDoPeriodo[];
  tratamentos: TratamentoDoRelatorio[];
  compromissos: CompromissoDoRelatorio[];
  /** Nome do titular, para o cabeçalho. */
  paciente: string;
  inicio: Date;
  agora: Date;
  /**
   * Quantos tratamentos existem no total, para o recorte poder ser declarado.
   *
   * Quando o relatório é filtrado por medicamento, `tratamentos.length` é menor que este número — e
   * o cabeçalho precisa dizer isso. Ver `recorte`.
   */
  totalDeTratamentos: number;
};

export type Relatorio = {
  paciente: string;
  inicio: Date;
  fim: Date;
  adesao: ResumoDeAdesao;
  tratamentos: TratamentoDoRelatorio[];
  compromissos: CompromissoDoRelatorio[];
  perdas: PerdaPorMedicamento[];
  /**
   * `null` quando o relatório cobre tudo; preenchido quando foi filtrado.
   *
   * Existe porque **um recorte muda o que o documento afirma**. Um PDF com 2 de 5 tratamentos não é
   * "a adesão do paciente" — é a adesão daqueles dois, e um leitor que não souber disso tira uma
   * conclusão que os dados não sustentam. É a mesma regra da RN20: o app não afirma sobre o
   * paciente o que os dados não dizem.
   */
  recorte: { selecionados: number; total: number } | null;
};

/**
 * Monta o conteúdo do relatório clínico — o que o PDF vai dizer, sem nada sobre como ele parece.
 *
 * Fica no domínio, e não no gerador do PDF, pelo mesmo motivo que `resumir-adesao` não mora na
 * tela: é conteúdo de documento clínico, e precisa ser verificável em Node sem aparelho, sem banco
 * e sem renderizador (§2.3.3, auditoria clínica). O gerador recebe isto pronto e só o veste em
 * HTML.
 *
 * **O princípio que decide o que entra:** o relatório é lido em consulta de quinze minutos, não
 * estudado. Ele responde *o que você está tomando, e você está tomando?* — e cada item a mais
 * compete com essa resposta. Por isso o histórico dose a dose fica de fora (é o que a exportação
 * em JSON faz) e as perdas vêm contadas, não enumeradas.
 */
export function montarRelatorio(input: RelatorioInput): Relatorio {
  const adesao = resumirAdesao({ doses: input.doses, agora: input.agora });

  const agoraIso = input.agora.toISOString();
  const porMedicamento = new Map<string, PerdaPorMedicamento>();

  for (const dose of input.doses) {
    // Mesmo corte de `resumirAdesao`: dose futura ainda pode ser tomada, e contá-la como perdida
    // faria o relatório piorar sozinho ao longo do dia.
    if (dose.scheduledFor > agoraIso) continue;
    if (dose.latestStatus === "confirmed") continue;

    const atual = porMedicamento.get(dose.medicationId) ?? {
      nome: dose.medicationName,
      puladas: 0,
      semResposta: 0,
    };
    // `deferred` cai em `semResposta` junto com `null`, como no resumo: o horário passou e ninguém
    // disse se tomou. "Vi e resolvo depois" é informação sobre o alarme, não sobre a dose.
    if (dose.latestStatus === "skipped") atual.puladas += 1;
    else atual.semResposta += 1;
    porMedicamento.set(dose.medicationId, atual);
  }

  const perdas = [...porMedicamento.values()].sort((a, b) => {
    // Mais perdas primeiro: é onde o tratamento está falhando, e é o que a consulta precisa
    // discutir. Empate pelo nome, para a ordem não dançar entre duas gerações do mesmo período.
    const diferenca = b.puladas + b.semResposta - (a.puladas + a.semResposta);
    return diferenca !== 0 ? diferenca : a.nome.localeCompare(b.nome);
  });

  const selecionados = input.tratamentos.length;
  const filtrado = selecionados > 0 && selecionados < input.totalDeTratamentos;

  return {
    paciente: input.paciente,
    inicio: input.inicio,
    fim: input.agora,
    adesao,
    tratamentos: input.tratamentos,
    compromissos: input.compromissos,
    perdas,
    recorte: filtrado ? { selecionados, total: input.totalDeTratamentos } : null,
  };
}
