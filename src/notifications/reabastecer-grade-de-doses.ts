import * as Crypto from "expo-crypto";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";

/** Os mesmos metadados que o cadastro grava. Linha nova nunca nasce sincronizada nem excluída. */
function syncFields() {
  return { updatedAt: new Date().toISOString(), syncedAt: null, deletedAt: null };
}

/** O que o reabastecimento fez, para o Diagnostico poder mostrar. */
export type ResultadoDoReabastecimento = {
  /** Zero explica um reabastecimento que nao fez nada. */
  tratamentos: number;
  /** Zero com tratamentos > 0 significa grade ja completa. */
  gravadas: number;
  /**
   * A dose mais distante no banco depois do reabastecimento.
   *
   * `gravadas: 0` sozinho e ambiguo: pode ser grade completa ou reabastecimento que falhou, e os
   * dois casos dao o mesmo numero. A data do fim distingue.
   */
  ultimaDose: string | null;
};

/**
 * Ate onde a grade e mantida cheia.
 *
 * O mesmo valor que o cadastro usa ao salvar, e dois numeros iguais de proposito: aqui ele responde
 * quanto futuro o app garante, la quanto gerar de primeira. Divergirem seria decisao, nao descuido.
 */
const HORIZONTE_EM_DIAS = 30;

/**
 * Repoe os horarios de dose que o tempo consumiu.
 *
 * Sem isto um tratamento continuo para de avisar por volta do 30o dia, sem erro e sem aviso: a
 * pessoa nao descobre que parou, so deixa de ser lembrada. O calendario ainda mostrava doses
 * futuras, porque as projeta a partir da posologia, o que escondia o problema.
 *
 * Fica dentro de `reagendarTodosOsAvisos` porque aquela ja e o unico ponto de entrada de todos os
 * gatilhos do ciclo de vida: assim nao ha um segundo caminho para esquecer de chamar.
 *
 * Acrescenta em vez de regerar. Regerar apagaria as doses futuras a cada abertura, e com elas o
 * `snoozeCount` e o vinculo que os registros de ingestao apontam. Mudanca de posologia continua
 * sendo assunto do cadastro; aqui nao se corrige horario, preenche-se vazio.
 *
 * Nunca lanca: falhar na manutencao nao pode impedir o reagendamento dos avisos que ja existem.
 */
export async function reabastecerGradeDeDoses(agora: Date): Promise<ResultadoDoReabastecimento> {
  const prescriptionRepository = new PrescriptionRepository();
  const doseScheduleRepository = new DoseScheduleRepository();
  let gravadas = 0;

  // `findActive` e nao `findAll`: descarta o excluido, que seria alarme orfao, e o tratamento cuja
  // `endDate` ja passou, que nao tem futuro a repor.
  const hoje = agora.toISOString().slice(0, 10);
  const prescriptions = await prescriptionRepository.findActive(hoje);
  const ate = new Date(agora.getTime() + HORIZONTE_EM_DIAS * 24 * 60 * 60_000);

  for (const prescription of prescriptions) {
    // A janela comeca agora, e nao no fim da grade existente: comecando depois da ultima dose
    // gravada, um buraco no meio nunca seria preenchido.
    const candidatos = generateDoseSchedules({ prescription, from: agora, until: ate });
    if (candidatos.length === 0) continue;

    /**
     * Inclui as excluidas, e compara por instante.
     *
     * Incluir as excluidas e o que impede o reabastecimento de desfazer uma edicao: editar a
     * posologia marca as futuras como excluidas, e olhando so as vivas elas apareceriam como
     * buracos, com o horario removido voltando a tocar com id novo.
     *
     * A comparacao e por instante, e nao pelo texto do ISO, porque o banco guarda os dois formatos:
     * o cadastro grava terminando em `Z`, e o que volta da sincronizacao vem com `+00:00`. Como
     * texto, nunca casariam, e a grade ganharia uma segunda dose para o mesmo horario.
     */
    const existentes = await doseScheduleRepository.findByPrescriptionIncluindoExcluidas(
      prescription.id,
    );
    const instantesExistentes = new Set(
      existentes.map((dose) => new Date(dose.scheduledFor).getTime()),
    );

    for (const candidato of candidatos) {
      if (instantesExistentes.has(new Date(candidato.scheduledFor).getTime())) continue;
      await doseScheduleRepository.save({
        id: Crypto.randomUUID(),
        ...candidato,
        ...syncFields(),
      });
      gravadas += 1;
    }
  }

  /**
   * Relê o banco depois de gravar, em vez de deduzir do que foi gerado: o que interessa é o estado
   * final, e ele inclui as doses que já estavam lá.
   */
  let ultimaDose: string | null = null;
  for (const prescription of prescriptions) {
    for (const dose of await doseScheduleRepository.findByPrescription(prescription.id)) {
      if (ultimaDose === null || new Date(dose.scheduledFor) > new Date(ultimaDose)) {
        ultimaDose = dose.scheduledFor;
      }
    }
  }

  return { tratamentos: prescriptions.length, gravadas, ultimaDose };
}
