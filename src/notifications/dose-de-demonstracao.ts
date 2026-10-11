import * as Crypto from "expo-crypto";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { forcarModoDaDose, reagendarTodosOsAvisos } from "./reagendar-avisos";

/**
 * Atalho da apresentação: cria uma dose de verdade para daqui a poucos segundos.
 *
 * Só existe na build com `EXPO_PUBLIC_MODO_DEMO=1`. A dose é gravada no banco e o aviso sai pelo
 * reagendamento de produção, então o alarme, o "Tomei" e a baixa do estoque são os de sempre. O
 * único desvio é o modo, que vem do botão e não da prescrição.
 */

/** O Tylenol é o cadastro completo da base de demonstração; sem ele, o tratamento mais recente. */
const REMEDIO_PREFERIDO = /t[iy]lenol/i;

export async function agendarDoseDeDemonstracao(
  modo: "alarm" | "notification",
  segundos: number,
): Promise<{ medicamento: string; quando: Date }> {
  const agora = new Date();
  const [prescricoes, medicamentos] = await Promise.all([
    new PrescriptionRepository().findActive(agora.toISOString().slice(0, 10)),
    new MedicationRepository().findAll(),
  ]);

  const nomePorId = new Map(medicamentos.map((m) => [m.id, m.name]));
  const candidatas = prescricoes
    .filter((p) => nomePorId.has(p.medicationId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const prescricao =
    candidatas.find((p) => REMEDIO_PREFERIDO.test(nomePorId.get(p.medicationId) ?? "")) ??
    candidatas[0];
  if (prescricao === undefined) throw new Error("Nenhum tratamento ativo para usar na demonstração.");

  // Segundo cheio: o instante vira a chave do aviso e aparece na tela do alarme.
  const quando = new Date(Math.ceil((agora.getTime() + segundos * 1000) / 1000) * 1000);
  const id = Crypto.randomUUID();
  forcarModoDaDose(id, modo);

  await new DoseScheduleRepository().save({
    id,
    prescriptionId: prescricao.id,
    scheduledFor: quando.toISOString(),
    amount: prescricao.doseAmount,
    notificationId: null,
    snoozeCount: 0,
    updatedAt: agora.toISOString(),
    syncedAt: null,
    deletedAt: null,
  });
  await reagendarTodosOsAvisos();

  return { medicamento: nomePorId.get(prescricao.medicationId) ?? "", quando };
}
