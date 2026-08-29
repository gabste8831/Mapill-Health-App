import * as Crypto from "expo-crypto";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { IntakeLogRepository } from "@/data/repositories/intake-log-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { RegisterIntake } from "@/domain/use-cases/register-intake";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { ACAO_ADIAR, ACAO_TOMEI, MINUTOS_DE_ADIAMENTO } from "./acoes";
import {
  ExpoNotificationGateway,
  PREFIXO_ADIADO,
  type DadosDoAviso,
} from "./expo-notification-gateway";
import { reagendarAvisosDeDose } from "./reagendar-avisos";

/**
 * "Tomei" — confirma **todas** as doses do horário e desconta o estoque de cada uma.
 *
 * O botão só existe com esse rótulo ("Tomei todas" quando há mais de uma), então confirmar o
 * conjunto é exatamente o que foi pedido. Resposta parcial não passa por aqui: ela se resolve na
 * tela do horário, aberta ao tocar no corpo da notificação.
 *
 * O `occurredAt` é **agora**, e não o horário agendado: o que o app observou foi a resposta, e
 * carimbar o horário previsto inventaria um dado que ninguém forneceu (§2.3.3 — o registro é de
 * monitoramento eletrônico, e ele vale por ser fiel ao que aconteceu de fato).
 */
export async function confirmarDosesDoAviso(doseScheduleIds: string[]): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();
  const prescriptionRepository = new PrescriptionRepository();
  const registerIntake = new RegisterIntake(new IntakeLogRepository(), new InventoryRepository());

  const agora = new Date().toISOString();

  for (const doseScheduleId of doseScheduleIds) {
    const doseSchedule = await doseScheduleRepository.findById(doseScheduleId);
    if (doseSchedule === null) continue;

    const prescription = await prescriptionRepository.findById(doseSchedule.prescriptionId);
    if (prescription === null) continue;

    await registerIntake.execute({
      id: Crypto.randomUUID(),
      doseScheduleId,
      medicationId: prescription.medicationId,
      status: "confirmed",
      occurredAt: agora,
      // A dose gravada no agendamento, e não a da prescrição: elas divergem quando a dose varia
      // por horário, e é a do agendamento que descreve o que se toma **nesta** vez.
      amount: doseSchedule.amount,
    });
  }

  // As doses confirmadas deixam de gerar aviso, e o horário reagendado some da fila.
  await reagendarAvisosDeDose();
}

/**
 * "Adiar" — empurra o aviso em alguns minutos, **sem registrar desfecho nenhum**.
 *
 * Nada é gravado no histórico: nem `confirmed`, nem `skipped`, nem `deferred`. Isso é deliberado e
 * importa mais quando o horário tem vários remédios. Quem tomou um e não o outro não está afirmando
 * nada sobre nenhum deles ao adiar — está dizendo "me lembra de novo daqui a pouco". Registrar um
 * desfecho ali inventaria uma resposta que ninguém deu, e num app cujo valor é a fidelidade do
 * registro isso é o erro mais caro.
 *
 * O que muda no banco é só `snoozeCount`, que é a trava: **um adiamento por horário**. Marcá-la em
 * todas as doses do aviso é o que faz o segundo toque não existir — o botão some, em vez de
 * aparecer e não funcionar.
 *
 * O aviso que volta é recalculado do zero, então traz só o que ainda estiver pendente: se a
 * Losartana foi confirmada pela Home nesse meio-tempo, ela não reaparece.
 */
export async function adiarAviso(doseScheduleIds: string[]): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();
  for (const doseScheduleId of doseScheduleIds) {
    // O repositório recusa passar de 1 — a trava mora nele, e não aqui, pra valer também quando o
    // adiamento vier da tela em vez da notificação.
    await doseScheduleRepository.incrementSnoozeCount(doseScheduleId).catch(() => {});
  }

  await reagendarAvisosDeDose();
  await agendarLembreteAdiado(doseScheduleIds);
}

/**
 * O aviso adiado propriamente dito.
 *
 * Fica separado de `reagendarAvisosDeDose` porque não pertence à janela: aquela função reconstrói
 * o que está **agendado por horário**, e o adiamento é um aviso extra, fora da grade, que existe
 * só até tocar. Colocá-lo na janela faria a próxima reconstrução apagá-lo.
 */
async function agendarLembreteAdiado(doseScheduleIds: string[]): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();
  const prescriptionRepository = new PrescriptionRepository();
  const medicationRepository = new MedicationRepository();

  const linhas: string[] = [];
  for (const doseScheduleId of doseScheduleIds) {
    const doseSchedule = await doseScheduleRepository.findById(doseScheduleId);
    if (doseSchedule === null) continue;
    const prescription = await prescriptionRepository.findById(doseSchedule.prescriptionId);
    if (prescription === null) continue;
    const medication = await medicationRepository.findById(prescription.medicationId);
    if (medication === null) continue;
    linhas.push(
      `${medication.name} — ${formatarQuantidade(doseSchedule.amount, prescription.doseUnit)}`,
    );
  }

  if (linhas.length === 0) return;

  const quando = new Date(Date.now() + MINUTOS_DE_ADIAMENTO * 60_000);
  await new ExpoNotificationGateway().agendar({
    // `PREFIXO_ADIADO` é o que faz este aviso escapar do `cancelarTudo` da grade: ele não pertence
    // à janela de horários, e sim ao toque em "Adiar" que acabou de acontecer.
    chave: `${PREFIXO_ADIADO}${quando.toISOString()}`,
    quando,
    titulo: linhas.length === 1 ? "Lembrete adiado" : `Lembrete adiado — ${linhas.length} remédios`,
    corpo: linhas.join("\n"),
    doseScheduleIds,
    modo: "alarm",
    // Já foi adiado: o aviso que volta não oferece adiar de novo.
    jaAdiado: true,
  });
}

/** O que o app deve fazer com a resposta a uma notificação. */
export type RespostaAoAviso =
  | { tipo: "abrirHorario"; dados: DadosDoAviso }
  /** Resolvida em segundo plano — o app não precisa navegar para lugar nenhum. */
  | { tipo: "resolvida" };

/**
 * Traduz a resposta do sistema numa ação do app.
 *
 * Os botões resolvem sem abrir o app (`opensAppToForeground: false`); o toque no **corpo** leva à
 * tela do horário, que é onde a resposta parcial cabe.
 */
export async function tratarRespostaAoAviso(
  actionIdentifier: string,
  dados: DadosDoAviso,
): Promise<RespostaAoAviso> {
  if (actionIdentifier === ACAO_TOMEI) {
    await confirmarDosesDoAviso(dados.doseScheduleIds);
    return { tipo: "resolvida" };
  }

  if (actionIdentifier === ACAO_ADIAR) {
    await adiarAviso(dados.doseScheduleIds);
    return { tipo: "resolvida" };
  }

  return { tipo: "abrirHorario", dados };
}
