import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose } from "@/domain/entities/intake-log";
import { planejarAvisosDeCompromisso } from "@/domain/use-cases/planejar-avisos-de-compromisso";
import {
  planejarAvisosDeDose,
  type DoseAAvisar,
} from "@/domain/use-cases/planejar-avisos-de-dose";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import {
  agendarAlarmeDeTelaCheia,
  cancelarAlarmesDeTelaCheia,
  registrarCanalDeAlarme,
} from "./alarme-em-tela-cheia";
import { ExpoNotificationGateway } from "./expo-notification-gateway";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então não há o que agendar. */
const persistsLocally = Platform.OS !== "web";

/**
 * Quantos dias de avisos ficam pendentes no sistema operacional.
 *
 * Sete, e não o tratamento inteiro: "3x ao dia por 6 meses" são ~540 avisos para **uma**
 * prescrição, e um paciente polimedicado passaria de 2.500 — acima do que qualquer sistema aceita
 * manter agendado. A janela é reabastecida a cada abertura do app, que é frequente o bastante num
 * app que a pessoa abre para confirmar dose.
 *
 * Casado com `SCHEDULE_HORIZON_DAYS` do cadastro, que é quantos dias de `DoseSchedule` existem no
 * banco: agendar aviso para dose que ainda não foi gerada não faria sentido.
 */
const JANELA_DE_AVISOS_EM_DIAS = 7;

const gateway = new ExpoNotificationGateway();

/**
 * A execução em curso, quando há uma.
 *
 * Reagendar é "cancela tudo, depois agenda tudo", e duas execuções sobrepostas se atropelam: a
 * segunda cancelaria justo o que a primeira acabou de agendar, e o que sobra depende de qual
 * terminou por último. Não é hipotético — salvar um cadastro e voltar ao primeiro plano disparam
 * os dois gatilhos quase juntos.
 *
 * A fila resolve serializando: quem chega enquanto outra roda espera a vez. Como a operação é
 * idempotente, esperar nunca custa correção — só tempo.
 */
let emAndamento: Promise<void> = Promise.resolve();

/**
 * Refaz **toda** a janela de avisos: cancela o que estiver agendado e reagenda a partir do banco.
 *
 * A operação é grosseira de propósito, e essa é a decisão central do bloco. O pior defeito
 * possível aqui é o **alarme órfão** — a pessoa recebe lembrete de um remédio que já parou de
 * tomar —, e ele nasce de tentar editar cirurgicamente o que já está agendado: some uma dose aqui,
 * muda um horário ali, e cada caminho esquecido vira um aviso que ninguém mais cancela. Cancelar
 * tudo e reagendar é **idempotente**: chamar duas vezes dá o mesmo resultado que chamar uma, e
 * qualquer estado anterior converge para o correto.
 *
 * Por isso ela é o único ponto de entrada. Todos os gatilhos do ciclo de vida — criar, editar ou
 * excluir tratamento, mudar o modo de lembrete, confirmar uma dose antes da hora, adiar, virar a
 * janela — chamam esta mesma função, e não variações espertas dela.
 *
 * Nunca lança: falhar em reagendar não pode derrubar o cadastro que acabou de ser salvo. O erro é
 * registrado e a próxima abertura do app corrige, porque a operação é idempotente.
 */
export async function reagendarTodosOsAvisos(): Promise<void> {
  if (!persistsLocally) return;

  // Entra na fila: `catch` no encadeamento para que uma falha anterior não trave as seguintes.
  emAndamento = emAndamento.catch(() => {}).then(() => executarReagendamento());
  return emAndamento;
}

async function executarReagendamento(): Promise<void> {
  try {
    // Sem permissão não há aviso a agendar, e pedir aqui seria pedir fora de contexto — quem pede
    // é a tela, no momento em que a pessoa liga o lembrete.
    if ((await gateway.consultarPermissao()) !== "concedida") {
      await gateway.cancelarTudo();
      // Os dois lados: alarme de tela cheia sem permissão de notificação não dispara, e deixá-lo
      // agendado só criaria um aviso fantasma para quando a permissão voltasse.
      await cancelarAlarmesDeTelaCheia();
      return;
    }

    const agora = new Date();
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
     * funções que se cancelam mutuamente — a segunda apagaria o que a primeira acabou de agendar,
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
            renewalReminderLeadDays: prescription.renewalReminderLeadDays,
          },
        ];
      }),
      agora,
      ate,
    });

    const avisos = [...planejarAvisosDeDose({ doses, agora, ate }), ...avisosDeCompromisso];

    /**
     * **Dois agendadores, um para cada promessa que o cadastro faz.**
     *
     * O modo `alarm` vai para o Notifee, que é quem sabe abrir tela cheia sobre o bloqueio — é o
     * despertador de verdade, com som contínuo, que a pessoa precisa vir desligar. Todo o resto
     * (lembretes, compromissos, receitas) continua no `expo-notifications`, que já cumpre bem o
     * papel de avisar sem interromper.
     *
     * A reconstrução completa da RN14 vale para os dois: cancelar tudo dos dois lados antes de
     * agendar qualquer coisa é o que garante zero alarme órfão. Cada biblioteca só enxerga a
     * própria lista, então esquecer um dos dois cancelamentos deixaria avisos de um tratamento já
     * excluído tocando para sempre.
     */
    await gateway.cancelarTudo();
    await cancelarAlarmesDeTelaCheia();

    await registrarCanalDeAlarme();

    for (const aviso of avisos) {
      if (aviso.modo === "alarm") await agendarAlarmeDeTelaCheia(aviso);
      else await gateway.agendar(aviso);
    }
  } catch (cause) {
    // Não relança: reagendar é consequência de outra ação (salvar um cadastro, confirmar uma
    // dose), e derrubar essa ação por causa do aviso trocaria um problema pequeno por um grande.
    // A próxima abertura do app refaz a janela inteira, então o estado se corrige sozinho.
    console.error("Falha ao reagendar os avisos de dose:", cause);
  }
}
