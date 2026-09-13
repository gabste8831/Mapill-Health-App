import * as Crypto from "expo-crypto";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";

/** Os mesmos metadados que o cadastro grava. Linha nova nunca nasce sincronizada nem excluída. */
function syncFields() {
  return { updatedAt: new Date().toISOString(), syncedAt: null, deletedAt: null };
}

/**
 * O que o reabastecimento fez — para o Diagnóstico poder **mostrar**.
 *
 * Na rodada de 13/09 esta função rodou dentro de um `try/catch` que engolia o erro, e o passo D.3
 * falhou sem nada aparecer em lugar nenhum: nem a dose na Home, nem um aviso, nem uma linha. Uma
 * manutenção que falha calada é o mesmo modo de falha que o defeito original — e pior, porque agora
 * há código dando a impressão de que o problema foi resolvido.
 */
export type ResultadoDoReabastecimento = {
  /** Quantos tratamentos ativos foram considerados. Zero explica um reabastecimento que não fez nada. */
  tratamentos: number;
  /** Quantas doses novas entraram no banco. Zero com tratamentos > 0 significa grade já completa. */
  gravadas: number;
};

/**
 * Até onde a grade de doses é mantida cheia, em dias.
 *
 * O mesmo valor que o cadastro usa ao salvar (`SCHEDULE_HORIZON_DAYS` em
 * `use-medication-registration`). São dois números iguais de propósito e não uma constante
 * compartilhada: aqui ele responde "quanto futuro o app garante", lá "quanto gerar de primeira".
 * Se um dia divergirem, é por decisão, não por descuido.
 */
const HORIZONTE_EM_DIAS = 30;

/**
 * Repõe os horários de dose que o tempo consumiu.
 *
 * ## O defeito que isto corrige
 *
 * Até 13/09 a grade era gerada num lugar só: o fluxo de salvar cadastro, que gravava 30 dias de
 * `DoseSchedule` e terminava ali. Nada a reabastecia — o comentário que prometia "a janela é
 * reabastecida depois" descrevia código que nunca existiu.
 *
 * A consequência, confirmada em aparelho pelo Gabriel (passo A.4, relógio adiantado 37 dias): um
 * tratamento contínuo **para de avisar por volta do 30º dia**, sem erro, sem aviso, sem nada. A
 * pessoa não descobre que parou; ela só deixa de ser lembrada. É o pior modo de falhar deste app,
 * porque a confiança já foi transferida para ele — e o calendário ainda mostrava doses futuras,
 * porque projeta os horários na hora a partir da posologia, o que tranquilizava e escondia.
 *
 * ## Por que aqui
 *
 * Fica dentro de `reagendarTodosOsAvisos`, antes de agendar, porque essa função já é o único ponto
 * de entrada de todos os gatilhos do ciclo de vida e já roda a cada abertura do app. Reabastecer
 * ali significa que qualquer coisa que faça o app reagendar também mantém a grade cheia — não há um
 * segundo caminho para esquecer de chamar. Agendar avisos a partir de uma grade vazia era justamente
 * o que acontecia.
 *
 * ## Por que acrescenta em vez de regerar
 *
 * Regerar apagaria e recriaria as doses futuras a cada abertura do app, e com elas o `snoozeCount`
 * (o adiamento já gasto voltaria a estar disponível) e o vínculo que os registros de ingestão
 * apontam. Esta função **só insere o que falta**: compara com o que já existe por instante e grava
 * a diferença. Rodar duas vezes seguidas não muda nada — a segunda não encontra buraco nenhum.
 *
 * Mudança de posologia continua sendo assunto do cadastro, que apaga as futuras e regera. Aqui não
 * se corrige horário: preenche-se vazio.
 *
 * Nunca lança: reabastecer é manutenção de fundo, e falhar nela não pode impedir o reagendamento
 * dos avisos que já existem. O erro sobe para quem chama registrar.
 */
export async function reabastecerGradeDeDoses(agora: Date): Promise<ResultadoDoReabastecimento> {
  const prescriptionRepository = new PrescriptionRepository();
  const doseScheduleRepository = new DoseScheduleRepository();
  let gravadas = 0;

  /**
   * `findActive` e não `findAll`: além de descartar o que foi excluído (que seria alarme órfão, o
   * defeito que o reagendamento inteiro existe para evitar), ela deixa de fora o tratamento cuja
   * `endDate` já passou. Esses não têm futuro a repor, e pedir doses deles só para
   * `generateDoseSchedules` as recortar seria trabalho por linha em toda abertura do app.
   */
  const hoje = agora.toISOString().slice(0, 10);
  const prescriptions = await prescriptionRepository.findActive(hoje);
  const ate = new Date(agora.getTime() + HORIZONTE_EM_DIAS * 24 * 60 * 60_000);

  for (const prescription of prescriptions) {
    /**
     * A janela começa **agora**, não no fim da grade existente.
     *
     * Poderia começar depois da última dose gravada, o que geraria menos candidatos. Mas então um
     * buraco no meio — dose apagada por um caminho qualquer, ou grade gravada antes de a posologia
     * ganhar um horário novo — nunca seria preenchido. Gerar a janela inteira e descartar o que já
     * existe custa uma comparação em memória e não deixa buraco de pé.
     */
    const candidatos = generateDoseSchedules({ prescription, from: agora, until: ate });
    if (candidatos.length === 0) continue;

    const existentes = await doseScheduleRepository.findByPrescription(prescription.id);
    const instantesExistentes = new Set(existentes.map((dose) => dose.scheduledFor));

    for (const candidato of candidatos) {
      if (instantesExistentes.has(candidato.scheduledFor)) continue;
      await doseScheduleRepository.save({
        id: Crypto.randomUUID(),
        ...candidato,
        ...syncFields(),
      });
      gravadas += 1;
    }
  }

  return { tratamentos: prescriptions.length, gravadas };
}
