import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { CadastroDeMedicamentoDraft } from "@/telas/CadastroDeMedicamento/CadastroDeMedicamentoScreen";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

/**
 * Quantos dias de horários são gerados de uma vez. Agendar até o infinito não cabe em banco nem
 * no limite de alarmes do sistema operacional — a janela é reabastecida depois (bloco C1).
 */
const SCHEDULE_HORIZON_DAYS = 30;

/**
 * Um cadastro produz três registros — o remédio, o tratamento e o estoque — mais os horários
 * derivados da posologia. Fica num lugar só porque nenhum deles faz sentido sozinho: prescrição
 * sem medicamento é órfã, e horário sem prescrição não sabe de que dose está falando.
 */
export async function saveMedicationRegistration(draft: CadastroDeMedicamentoDraft): Promise<void> {
  if (!persistsLocally) return;

  const now = new Date().toISOString();
  const syncFields = { updatedAt: now, syncedAt: null, deletedAt: null };

  const medicationId = Crypto.randomUUID();
  await new MedicationRepository().save({
    id: medicationId,
    name: draft.name,
    activeIngredient: draft.activeIngredient,
    // A apresentação textual da CMED (B1) entra aqui quando existir; no manual o paciente já
    // descreve isso no nome, então gravar vazio é mais honesto que repetir a forma.
    presentation: "",
    form: draft.form,
    photoUri: draft.photoUri,
    ean: null,
    fromCmed: false,
    ...syncFields,
  });

  const prescriptionId = Crypto.randomUUID();
  const prescription = {
    id: prescriptionId,
    medicationId,
    doseAmount: draft.doseAmount,
    doseUnit: draft.doseUnit,
    schedule: draft.schedule,
    startDate: draft.startDate,
    endDate: draft.endDate,
    reminderMode: draft.reminderMode,
    notes: draft.notes,
    attachmentUri: null,
    attachmentKind: null,
    attachmentSyncOptOut: false,
    ...syncFields,
  };
  await new PrescriptionRepository().save(prescription);

  if (draft.stockQuantity !== null || draft.storageLocation !== null) {
    await new InventoryRepository().save({
      id: Crypto.randomUUID(),
      medicationId,
      quantity: draft.stockQuantity ?? 0,
      unit: draft.doseUnit,
      // Alerta de estoque é escolha explícita do paciente (decisão nº1) — nunca ligado sozinho.
      lowStockAlertEnabled: false,
      lowStockAlertLeadDays: null,
      storageLocation: draft.storageLocation,
      ...syncFields,
    });
  }

  const from = new Date();
  const until = new Date(from.getTime() + SCHEDULE_HORIZON_DAYS * 24 * 60 * 60_000);
  const doseScheduleRepository = new DoseScheduleRepository();
  for (const doseSchedule of generateDoseSchedules({ prescription, from, until })) {
    await doseScheduleRepository.save({
      id: Crypto.randomUUID(),
      ...doseSchedule,
      ...syncFields,
    });
  }
}
