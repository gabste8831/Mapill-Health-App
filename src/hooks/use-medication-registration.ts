import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import type { MedicamentoDraft } from "@/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

/**
 * Quantos dias de horários são gerados de uma vez. Agendar até o infinito não cabe em banco nem
 * no limite de alarmes do sistema operacional — a janela é reabastecida depois (bloco C1).
 */
const SCHEDULE_HORIZON_DAYS = 30;

/** Identifica um cadastro existente. Ausente = criar; presente = atualizar. */
export type MedicamentoIds = {
  medicationId: string;
  prescriptionId: string;
};

function syncFields() {
  return { updatedAt: new Date().toISOString(), syncedAt: null, deletedAt: null };
}

/**
 * Grava um cadastro inteiro — medicamento, tratamento, estoque e horários. Cria quando `ids` é
 * omitido e atualiza quando vem preenchido; é a mesma operação porque a tela é a mesma, e
 * duplicar isso em "salvar" e "atualizar" faria as duas divergirem com o tempo.
 *
 * Os três registros andam juntos porque nenhum faz sentido sozinho: prescrição sem medicamento
 * é órfã, e horário sem prescrição não sabe de que dose está falando.
 */
export async function salvarMedicamento(
  draft: MedicamentoDraft,
  ids?: MedicamentoIds,
): Promise<MedicamentoIds> {
  const medicationId = ids?.medicationId ?? Crypto.randomUUID();
  const prescriptionId = ids?.prescriptionId ?? Crypto.randomUUID();
  if (!persistsLocally) return { medicationId, prescriptionId };

  const medicationRepository = new MedicationRepository();
  const existingMedication = await medicationRepository.findById(medicationId);
  await medicationRepository.save({
    ...(existingMedication ?? {
      // A apresentação textual vem da CMED (B1). No manual o paciente já descreve isso no nome,
      // então gravar vazio é mais honesto que repetir a forma farmacêutica.
      presentation: "",
      ean: null,
      fromCmed: false,
    }),
    id: medicationId,
    name: draft.name,
    activeIngredient: draft.activeIngredient,
    form: draft.form,
    prescriptionRequirement: draft.prescriptionRequirement,
    photoUri: draft.photoUri,
    ...syncFields(),
  });

  const prescription = {
    id: prescriptionId,
    medicationId,
    doseAmount: draft.doseAmount,
    doseUnit: draft.doseUnit,
    schedule: draft.schedule,
    startDate: draft.startDate,
    endDate: draft.endDate,
    reminderMode: draft.reminderMode,
    intakeInstructions: draft.intakeInstructions,
    intakeNote: draft.intakeNote,
    notes: draft.notes,
    attachmentUri: draft.attachmentUri,
    attachmentKind: draft.attachmentKind,
    attachmentValidUntil: draft.attachmentValidUntil,
    renewalReminderLeadDays: draft.renewalReminderLeadDays,
    attachmentSyncOptOut: false,
    ...syncFields(),
  };
  await new PrescriptionRepository().save(prescription);

  const inventoryRepository = new InventoryRepository();
  const existingInventory = await inventoryRepository.findByMedication(medicationId);
  const tracksStock = draft.stockQuantity !== null || draft.storageLocation !== null;
  if (tracksStock || existingInventory !== null) {
    await inventoryRepository.save({
      id: existingInventory?.id ?? Crypto.randomUUID(),
      medicationId,
      quantity: draft.stockQuantity ?? 0,
      unit: draft.stockUnit,
      lowStockAlertEnabled: draft.lowStockAlertEnabled,
      lowStockAlertLeadDays: draft.lowStockAlertLeadDays,
      storageLocation: draft.storageLocation,
      ...syncFields(),
    });
  }

  /**
   * Numa edição a posologia pode ter mudado, então os horários futuros são regerados. Só os
   * futuros: apagar os passados destruiria o histórico de quando a dose era pra ter acontecido,
   * que é justamente o que o registro de ingestão referencia.
   */
  const doseScheduleRepository = new DoseScheduleRepository();
  const from = new Date();
  if (ids !== undefined) await doseScheduleRepository.deleteUpcoming(prescriptionId, from.toISOString());

  const until = new Date(from.getTime() + SCHEDULE_HORIZON_DAYS * 24 * 60 * 60_000);
  for (const doseSchedule of generateDoseSchedules({ prescription, from, until })) {
    await doseScheduleRepository.save({ id: Crypto.randomUUID(), ...doseSchedule, ...syncFields() });
  }

  return { medicationId, prescriptionId };
}
