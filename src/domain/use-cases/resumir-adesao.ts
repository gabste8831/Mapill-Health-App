import type { IntakeStatus } from "../entities/intake-log";

/**
 * Uma dose do período, com o desfecho que ela teve.
 *
 * `latestStatus: null` = ninguém respondeu. **Não é o mesmo que "pulada"**, e a diferença é o
 * centro deste cálculo: pular é uma decisão registrada, não responder é a ausência dela.
 */
export type DoseDoPeriodo = {
  doseScheduleId: string;
  scheduledFor: string;
  medicationId: string;
  medicationName: string;
  latestStatus: IntakeStatus | null;
};

export type ResumirAdesaoInput = {
  doses: DoseDoPeriodo[];
  /**
   * Agora. Doses **futuras** não entram na conta: uma dose das 22:00 vista ao meio-dia ainda não
   * foi perdida, e contá-la como não tomada faria a adesão de todo mundo despencar toda manhã.
   */
  agora: Date;
};

/** Quantas doses de cada desfecho, num recorte qualquer. */
export type ContagemDeDoses = {
  /** Doses que já venceram — o denominador honesto da adesão. */
  previstas: number;
  confirmadas: number;
  puladas: number;
  /**
   * Venceram e ninguém respondeu. Ficam separadas de `puladas` de propósito: para a adesão as duas
   * contam igual (o remédio não foi tomado), mas para a **conversa com o médico** elas são
   * diferentes — "decidi não tomar" e "esqueci" pedem condutas opostas.
   */
  semResposta: number;
};

export type AdesaoPorMedicamento = ContagemDeDoses & {
  medicationId: string;
  medicationName: string;
  /** `0` a `1`. `null` quando não houve dose prevista — sem denominador não há percentual. */
  taxa: number | null;
};

export type ResumoDeAdesao = ContagemDeDoses & {
  /**
   * A taxa geral, de `0` a `1`. `null` quando nenhuma dose venceu ainda no período.
   *
   * `null` e não `0`: zero afirma que nada foi tomado, e é exatamente a leitura errada de quem
   * acabou de cadastrar o primeiro remédio. A tela decide como dizer "ainda não há o que medir".
   */
  taxa: number | null;
  /** Por medicamento, do pior para o melhor — quem precisa de atenção aparece primeiro. */
  porMedicamento: AdesaoPorMedicamento[];
};

/** Uma dose vencida e não respondida, para a lista de perdidas. */
export type DosePerdida = {
  doseScheduleId: string;
  scheduledFor: string;
  medicationName: string;
  /** `skipped` (decidiu não tomar) ou `null` (não respondeu). */
  status: Extract<IntakeStatus, "skipped"> | null;
};

function contarVazio(): ContagemDeDoses {
  return { previstas: 0, confirmadas: 0, puladas: 0, semResposta: 0 };
}

/**
 * `deferred` conta como **sem resposta**, e não como categoria própria.
 *
 * Ele registra "vi e resolvo depois" — informação sobre o alarme, não sobre a dose. Se o horário
 * passou e a pessoa nunca voltou para dizer se tomou, o que se sabe é que ela não respondeu; dar a
 * isso uma terceira coluna no resumo do médico separaria duas coisas que, do ponto de vista
 * clínico, são a mesma: o remédio não foi tomado e ninguém disse por quê.
 */
function acumular(contagem: ContagemDeDoses, status: IntakeStatus | null): void {
  contagem.previstas += 1;
  if (status === "confirmed") contagem.confirmadas += 1;
  else if (status === "skipped") contagem.puladas += 1;
  else contagem.semResposta += 1;
}

/** `confirmadas / previstas`, ou `null` quando não há denominador. */
function taxaDe(contagem: ContagemDeDoses): number | null {
  return contagem.previstas === 0 ? null : contagem.confirmadas / contagem.previstas;
}

/**
 * A taxa de adesão de um período, no geral e por medicamento.
 *
 * **Adesão aqui é `confirmadas ÷ previstas`**, e "previstas" são só as doses cujo horário já
 * passou. As três decisões que isso carrega:
 *
 * 1. **Dose futura não conta.** Ela ainda pode ser tomada. Incluí-la faria a adesão cair sozinha ao
 *    longo do dia e subir de novo à noite, medindo a hora do relógio em vez do comportamento.
 *
 * 2. **Pular reduz a adesão.** Pular é uma resposta legítima e o app nunca a trata como erro, mas
 *    adesão mede o que foi *tomado* — e um resumo que contasse a pulada como sucesso mentiria
 *    justamente para quem vai levá-lo ao médico.
 *
 * 3. **Não responder conta igual a pular, no número, e diferente na lista.** Para a taxa as duas
 *    significam "não tomou". Para a conversa clínica são opostas: "decidi não tomar" e "esqueci"
 *    pedem condutas diferentes, e é por isso que `semResposta` existe como campo próprio.
 *
 * Regra pura, com `agora` injetado — é o que o "pronto quando" do D2 pede: o percentual calculado
 * por um use-case testável, e não dentro da tela (§2.3.3, auditoria clínica).
 */
export function resumirAdesao(input: ResumirAdesaoInput): ResumoDeAdesao {
  const agoraIso = input.agora.toISOString();
  const geral = contarVazio();
  const porMedicamento = new Map<string, AdesaoPorMedicamento>();

  for (const dose of input.doses) {
    if (dose.scheduledFor > agoraIso) continue;

    acumular(geral, dose.latestStatus);

    const atual =
      porMedicamento.get(dose.medicationId) ??
      ({
        medicationId: dose.medicationId,
        medicationName: dose.medicationName,
        taxa: null,
        ...contarVazio(),
      } satisfies AdesaoPorMedicamento);
    acumular(atual, dose.latestStatus);
    porMedicamento.set(dose.medicationId, atual);
  }

  const lista = [...porMedicamento.values()].map((item) => ({ ...item, taxa: taxaDe(item) }));
  // Pior primeiro: a lista existe para achar onde o tratamento está falhando, e quem está em 100%
  // não precisa ser lido. Empate desempata pelo nome, para a ordem não dançar entre aberturas.
  lista.sort((a, b) => {
    const diferenca = (a.taxa ?? 1) - (b.taxa ?? 1);
    return diferenca !== 0 ? diferenca : a.medicationName.localeCompare(b.medicationName);
  });

  return { ...geral, taxa: taxaDe(geral), porMedicamento: lista };
}

/**
 * As doses que venceram e não foram tomadas — puladas ou sem resposta.
 *
 * Mais recentes primeiro: o que aconteceu ontem explica mais sobre o tratamento de hoje do que o
 * que aconteceu há três semanas.
 */
export function listarDosesPerdidas(input: ResumirAdesaoInput): DosePerdida[] {
  const agoraIso = input.agora.toISOString();

  // `deferred` entra aqui, e não fica de fora: o horário passou e a dose continua sem resposta —
  // é o mesmo caso do `null`. A intenção de "resolver depois" não muda o que aconteceu com o
  // remédio, e esconder essas doses da lista deixaria de fora justamente as que a pessoa viu e
  // não resolveu. Mesma regra que `acumular` usa no resumo.
  return input.doses
    .filter((dose) => dose.scheduledFor <= agoraIso && dose.latestStatus !== "confirmed")
    .map<DosePerdida>((dose) => ({
      doseScheduleId: dose.doseScheduleId,
      scheduledFor: dose.scheduledFor,
      medicationName: dose.medicationName,
      // `deferred` cai em `null` junto com "nunca respondeu": para quem lê a lista, os dois são
      // "o horário passou em branco".
      status: dose.latestStatus === "skipped" ? "skipped" : null,
    }))
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
}
