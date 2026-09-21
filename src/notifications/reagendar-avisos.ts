import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose } from "@/domain/entities/intake-log";
import type { PosologyUnit } from "@/domain/entities/medication";
import { planejarAvisosDeCompromisso } from "@/domain/use-cases/planejar-avisos-de-compromisso";
import { estimateStockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import { planejarAvisosDeEstoque } from "@/domain/use-cases/planejar-avisos-de-estoque";
import {
  planejarAvisosDeDose,
  type DoseAAvisar,
} from "@/domain/use-cases/planejar-avisos-de-dose";
import { diaEMesDoIso } from "@/shared/datas-por-extenso";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { diagnosticarCanalDeAlarme } from "./canais-notifee";
import { esquecerAlarmesAbertos } from "./escutar-avisos";
import { NotifeeGateway } from "./notifee-gateway";
import { reabastecerGradeDeDoses } from "./reabastecer-grade-de-doses";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há o que agendar. */
const persistsLocally = Platform.OS !== "web";

/**
 * O que a ultima manutencao da grade fez, lido pelo Diagnostico.
 *
 * Sem este registro, "a correcao nao funcionou" e "a correcao nem rodou" sao indistinguiveis com o
 * APK na mao, porque o `catch` abaixo escreve no console, que ninguem le.
 *
 * No modulo, e nao em estado de React: quem chama o reagendamento nao e uma tela, sao os gatilhos
 * do ciclo de vida.
 */
export type ManutencaoDaGrade = {
  quando: string;
  tratamentos: number;
  gravadas: number;
  /** Até quando a grade alcança. É o que responde "o tratamento contínuo sobrevive aos 30 dias?". */
  ultimaDose: string | null;
  erro: string | null;
};

let ultimaManutencao: ManutencaoDaGrade | null = null;

/** O que a última manutenção fez, ou `null` se nenhuma rodou nesta execução. */
export function lerUltimaManutencaoDaGrade(): ManutencaoDaGrade | null {
  return ultimaManutencao;
}

/**
 * Quantos dias de avisos ficam pendentes no sistema.
 *
 * Sete, e nao o tratamento inteiro: um paciente polimedicado passaria de 2.500 avisos, acima do que
 * o sistema aceita manter agendado. A janela e reabastecida a cada abertura do app.
 *
 * Casado com o horizonte do cadastro: agendar aviso para dose que ainda nao foi gerada nao faria
 * sentido.
 */
const JANELA_DE_AVISOS_EM_DIAS = 7;

const gateway = new NotifeeGateway();

/**
 * A execucao em curso, quando ha uma.
 *
 * Reagendar e "cancela tudo, depois agenda tudo", e duas execucoes sobrepostas se atropelam: a
 * segunda cancelaria o que a primeira acabou de agendar. Acontece de verdade, porque salvar um
 * cadastro e voltar ao primeiro plano disparam os dois gatilhos quase juntos.
 */
let emAndamento: Promise<void> = Promise.resolve();

/**
 * Refaz toda a janela de avisos: cancela o agendado e reagenda a partir do banco.
 *
 * Grosseira de proposito, e essa e a decisao central do bloco. O pior defeito possivel e o alarme
 * orfao, e ele nasce de tentar editar cirurgicamente o que ja esta agendado: cada caminho esquecido
 * vira um aviso que ninguem mais cancela. Cancelar tudo e reagendar e idempotente, e qualquer
 * estado anterior converge para o correto.
 *
 * Por isso e o unico ponto de entrada: todos os gatilhos do ciclo de vida chamam esta funcao, e nao
 * variacoes espertas dela.
 *
 * Nunca lanca: falhar em reagendar nao pode derrubar o cadastro que acabou de ser salvo.
 */
export async function reagendarTodosOsAvisos(): Promise<void> {
  if (!persistsLocally) return;

  // Entra na fila: `catch` no encadeamento para que uma falha anterior não trave as seguintes.
  emAndamento = emAndamento.catch(() => {}).then(() => executarReagendamento());
  return emAndamento;
}

async function executarReagendamento(): Promise<void> {
  try {
    // A grade vai ser reconstruída: o que o listener lembra de ter aberto deixa de valer, porque os
    // horários que voltarem serão outros registros com o mesmo instante. Ver `esquecerAlarmesAbertos`.
    esquecerAlarmesAbertos();

    const agora = new Date();

    /**
     * A grade e posta em dia antes da guarda de permissao, e a ordem e a correcao.
     *
     * A guarda existe para avisos, nao para a grade: `DoseSchedule` e o que a Home lista, o que o
     * calendario mostra e o que o historico referencia, e nada disso depende de o Android deixar
     * notificar. Depois da guarda, quem negou a permissao perdia tambem a agenda.
     *
     * O `catch` e deliberado: manter a grade e manutencao de fundo, e falhar nela nao pode impedir
     * o reagendamento dos avisos que ja existem.
     */
    try {
      const reposicao = await reabastecerGradeDeDoses(agora);
      ultimaManutencao = {
        quando: agora.toISOString(),
        tratamentos: reposicao.tratamentos,
        gravadas: reposicao.gravadas,
        ultimaDose: reposicao.ultimaDose,
        erro: null,
      };
    } catch (erro) {
      // O erro e guardado, e nao so registrado no console: `console.warn` nao existe para quem
      // testa com o APK na mao, e sem rastro a falha era indistinguivel de nao ter rodado.
      ultimaManutencao = {
        quando: agora.toISOString(),
        tratamentos: 0,
        gravadas: 0,
        ultimaDose: null,
        erro: erro instanceof Error ? erro.message : String(erro),
      };
      console.warn("[avisos] falha ao manter a grade de doses", erro);
    }

    /**
     * Daqui para baixo é só **agendamento**, e é isso que a permissão gateia.
     *
     * Sem permissão não há aviso a agendar, e pedir aqui seria pedir fora de contexto - quem pede é
     * a tela, no momento em que a pessoa liga o lembrete. A grade já foi mantida acima, e continua
     * sendo mantida em toda abertura mesmo com a permissão negada: a Home, o calendário e o
     * histórico dependem dela, e nenhum deles depende do Android deixar notificar.
     */
    if ((await gateway.consultarPermissao()) !== "concedida") {
      await gateway.cancelarTudo();
      return;
    }

    const ate = new Date(agora.getTime() + JANELA_DE_AVISOS_EM_DIAS * 24 * 60 * 60_000);

    const [comStatus, prescriptions, medications] = await Promise.all([
      new DoseScheduleRepository().findBetween(agora.toISOString(), ate.toISOString()),
      new PrescriptionRepository().findAll(),
      new MedicationRepository().findAll(),
    ]);

    const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
    const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

    const doses: DoseAAvisar[] = [];
    for (const { doseSchedule, latestStatus } of comStatus) {
      const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
      const medication = prescription && medicamentoPorId.get(prescription.medicationId);
      // Tratamento ou medicamento excluídos: a linha continua no banco como histórico, mas avisar
      // sobre ela seria exatamente o alarme órfão que esta função existe para evitar.
      if (!prescription || !medication) continue;

      doses.push({
        doseScheduleId: doseSchedule.id,
        scheduledFor: doseSchedule.scheduledFor,
        medicationName: medication.name,
        quantidadeFormatada: formatarQuantidade(doseSchedule.amount, prescription.doseUnit),
        reminderMode: prescription.reminderMode,
        jaResolvida: resolvesDose(latestStatus),
        jaAdiada: doseSchedule.snoozeCount > 0,
      });
    }

    /**
     * Compromissos e receitas entram na **mesma** reconstrução, e não numa função paralela.
     *
     * São a mesma operação: cancelar tudo e reagendar a partir do banco. Separá-las criaria duas
     * funções que se cancelam mutuamente - a segunda apagaria o que a primeira acabou de agendar,
     * porque `cancelarTudo` não sabe distinguir de quem é cada aviso pendente.
     */
    const appointments = await new AppointmentRepository().findAll();
    const avisosDeCompromisso = planejarAvisosDeCompromisso({
      compromissos: appointments.map((appointment) => ({
        appointmentId: appointment.id,
        scheduledFor: appointment.scheduledFor,
        titulo: appointment.title,
        reminderLeadDays: appointment.reminderLeadDays,
        reminderOnDay: appointment.reminderOnDay,
        jaRespondido: appointment.outcome !== null,
      })),
      // A receita mora na prescrição, e só entra quando tem validade **e** pedido de aviso. O
      // medicamento excluído fica de fora pelo mesmo motivo das doses: não há o que renovar.
      receitas: prescriptions.flatMap((prescription) => {
        const medication = medicamentoPorId.get(prescription.medicationId);
        if (medication === undefined) return [];
        if (prescription.attachmentValidUntil === null) return [];
        return [
          {
            prescriptionId: prescription.id,
            medicationName: medication.name,
            validUntil: prescription.attachmentValidUntil,
            querAviso: prescription.renewalReminderEnabled,
            renewalReminderLeadDays: prescription.renewalReminderLeadDays,
          },
        ];
      }),
      agora,
      ate,
    });

    /**
     * O estoque, que é o terceiro tipo de aviso - e o único cuja data é uma **previsão**.
     *
     * A conta vem de `estimateStockDepletion`, a mesma que alimenta o cartão da Home e a tela de
     * estoque: refazê-la aqui faria o aviso e a tela discordarem no dia em que a regra mudasse.
     *
     * O cartão da Home continua existindo e não depende disto: ele é o canal que funciona mesmo
     * com as notificações negadas. Estes avisos são o que alcança quem não abriu o app.
     */
    const inventories = await new InventoryRepository().findAll();
    const avisosDeEstoque = planejarAvisosDeEstoque({
      estoques: inventories.flatMap((inventory) => {
        const medication = medicamentoPorId.get(inventory.medicationId);
        if (medication === undefined) return [];
        if (!inventory.lowStockAlertEnabled) return [];

        // A mais recente entre as do medicamento: é a que está valendo, e portanto a que dita o
        // ritmo com que o estoque é consumido. Mesma escolha de `use-today-doses`.
        const prescription = prescriptions
          .filter((p) => p.medicationId === inventory.medicationId)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        if (prescription === undefined) return [];

        const depletion = estimateStockDepletion(
          prescription,
          { amount: inventory.quantity, unit: inventory.unit as PosologyUnit },
          agora,
        );
        // Sem estimativa não há data para agendar - sem horário fixo, unidades incompatíveis, ou
        // um estoque que dura além do horizonte. Nos três o cartão da Home segue como o canal.
        if (depletion === null) return [];

        return [
          {
            inventoryId: inventory.id,
            medicationName: medication.name,
            diasRestantes: depletion.daysRemaining,
            ultimoDia: depletion.lastDay,
            ultimoDiaFormatado: diaEMesDoIso(depletion.lastDay),
            querAviso: inventory.lowStockAlertEnabled,
            avisoLeadDays: inventory.lowStockAlertLeadDays,
            quantidadeQuandoAvisou: inventory.lowStockAlertedAtQuantity,
            quantidadeAtual: inventory.quantity,
          },
        ];
      }),
      agora,
      ate,
    });

    const avisos = [
      ...planejarAvisosDeDose({ doses, agora, ate }),
      ...avisosDeCompromisso,
      ...avisosDeEstoque,
    ];

    // Com um agendador so, "cancelar tudo" e literalmente tudo, e o alarme orfao deixa de ser
    // possivel em vez de ser evitado por disciplina.
    await gateway.cancelarTudo();

    /**
     * Um aviso que falha nao leva os outros junto.
     *
     * Sem o `catch` por item, uma rejeicao aborta o laco e a grade do dia fica pela metade, sem
     * nada indicar quais entraram. Perder um aviso e ruim; perder os vinte seguintes e pior.
     */
    for (const aviso of avisos) {
      // O modo decide o canal e se abre tela cheia; quem agenda é o mesmo gateway nos dois casos.
      try {
        await gateway.agendar(aviso);
      } catch (cause) {
        if (__DEV__) console.error(`[Mapill] falha ao agendar ${aviso.chave}:`, cause);
      }
    }

    /**
     * A marca do aviso de estoque NAO e gravada aqui, e este comentario existe para a tentacao nao
     * voltar.
     *
     * Reagendar roda a cada volta ao primeiro plano. Com a marca gravada no planejamento, o aviso
     * era planejado, a quantidade de agora gravada, e o reagendamento seguinte comparava a
     * quantidade consigo mesma e concluia que ja avisara: o aviso de estoque sumia em segundos.
     *
     * A trava so faz sentido depois de o aviso ter chegado, e quem grava e o listener, na entrega.
     */

    /**
     * O estado real depois de reconstruir, e nao so o que se tentou agendar.
     *
     * Este bloco ja falhou em silencio: o agendamento e aceito, nenhum erro aparece, e o alarme nao
     * toca - por canal mudo, permissao que o Android nao pede sozinho, ou dose fora da janela. As
     * tres causas dao o mesmo sintoma.
     */
    if (__DEV__) {
      const alarmes = avisos.filter((aviso) => aviso.modo === "alarm").length;
      const notificacoes = avisos.length - alarmes;
      console.log(
        `[Mapill] janela refeita: ${avisos.length} aviso(s): ${alarmes} alarme(s), ${notificacoes} notificação(ões); ${doses.length} dose(s) na janela de ${JANELA_DE_AVISOS_EM_DIAS} dias`,
      );
      console.log(`[Mapill] canal do alarme → ${await diagnosticarCanalDeAlarme()}`);
    }
  } catch (cause) {
    // Não relança: reagendar é consequência de outra ação (salvar um cadastro, confirmar uma
    // dose), e derrubar essa ação por causa do aviso trocaria um problema pequeno por um grande.
    // A próxima abertura do app refaz a janela inteira, então o estado se corrige sozinho.
    console.error("Falha ao reagendar os avisos de dose:", cause);
  }
}
