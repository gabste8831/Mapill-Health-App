import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import type {
  MedicationForm,
  PosologyUnit,
  PrescriptionRequirement,
} from "@/domain/entities/medication";
import type { PosologySchedule, ReminderMode } from "@/domain/entities/prescription";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

/**
 * Quantos dias de horários são gerados de uma vez. Agendar até o infinito não cabe em banco nem
 * no limite de alarmes do sistema operacional — a janela é reabastecida depois (bloco C1).
 */
const SCHEDULE_HORIZON_DAYS = 30;

/** O que a etapa 1 coleta: o mínimo pro app já conseguir lembrar o paciente da dose. */
export type CadastroEssencial = {
  name: string;
  activeIngredient: string;
  form: MedicationForm;
  prescriptionRequirement: PrescriptionRequirement;
  doseAmount: number;
  doseUnit: PosologyUnit;
  schedule: PosologySchedule;
  startDate: string;
  endDate: string | null;
};

/** O que a etapa 2 acrescenta. Tudo opcional — o medicamento já existe sem nada disto. */
export type CadastroDetalhes = {
  photoUri: string | null;
  reminderMode: ReminderMode;
  notes: string | null;
  stockQuantity: number | null;
  lowStockAlertEnabled: boolean;
  lowStockAlertLeadDays: number | null;
  storageLocation: string | null;
  attachmentUri: string | null;
  attachmentValidUntil: string | null;
};

/** Devolvido pela etapa 1 para a etapa 2 saber o que completar. */
export type CadastroIds = {
  medicationId: string;
  prescriptionId: string;
};

function syncFields() {
  return { updatedAt: new Date().toISOString(), syncedAt: null, deletedAt: null };
}

/**
 * Grava o essencial e devolve os ids. É chamado ao **avançar** para os detalhes, não só ao
 * concluir: quem desiste no meio da etapa 2 sai com o medicamento já cadastrado e funcionando,
 * em vez de perder tudo o que digitou.
 *
 * Cria os três registros de uma vez porque nenhum faz sentido sozinho: prescrição sem
 * medicamento é órfã, e horário sem prescrição não sabe de que dose está falando.
 */
export async function saveCadastroEssencial(essencial: CadastroEssencial): Promise<CadastroIds> {
  const medicationId = Crypto.randomUUID();
  const prescriptionId = Crypto.randomUUID();
  if (!persistsLocally) return { medicationId, prescriptionId };

  await new MedicationRepository().save({
    id: medicationId,
    name: essencial.name,
    activeIngredient: essencial.activeIngredient,
    // A apresentação textual vem da CMED (B1). No manual o paciente já descreve isso no nome,
    // então gravar vazio é mais honesto que repetir a forma farmacêutica.
    presentation: "",
    form: essencial.form,
    prescriptionRequirement: essencial.prescriptionRequirement,
    photoUri: null,
    ean: null,
    fromCmed: false,
    ...syncFields(),
  });

  const prescription = {
    id: prescriptionId,
    medicationId,
    doseAmount: essencial.doseAmount,
    doseUnit: essencial.doseUnit,
    schedule: essencial.schedule,
    startDate: essencial.startDate,
    endDate: essencial.endDate,
    // Notificação comum é o padrão até o paciente escolher outro nos detalhes — silêncio por
    // omissão seria pior num app cuja função é lembrar.
    reminderMode: "notification" as ReminderMode,
    notes: null,
    attachmentUri: null,
    attachmentKind: null,
    attachmentValidUntil: null,
    attachmentSyncOptOut: false,
    ...syncFields(),
  };
  await new PrescriptionRepository().save(prescription);

  const from = new Date();
  const until = new Date(from.getTime() + SCHEDULE_HORIZON_DAYS * 24 * 60 * 60_000);
  const doseScheduleRepository = new DoseScheduleRepository();
  for (const doseSchedule of generateDoseSchedules({ prescription, from, until })) {
    await doseScheduleRepository.save({ id: Crypto.randomUUID(), ...doseSchedule, ...syncFields() });
  }

  return { medicationId, prescriptionId };
}

/**
 * Completa um cadastro já gravado. Só toca no que os detalhes trazem — o essencial permanece
 * como a etapa 1 deixou.
 */
export async function completarCadastro(ids: CadastroIds, detalhes: CadastroDetalhes): Promise<void> {
  if (!persistsLocally) return;

  const medicationRepository = new MedicationRepository();
  const medication = await medicationRepository.findById(ids.medicationId);
  if (medication !== null) {
    await medicationRepository.save({ ...medication, photoUri: detalhes.photoUri, ...syncFields() });
  }

  const prescriptionRepository = new PrescriptionRepository();
  const prescription = await prescriptionRepository.findById(ids.prescriptionId);
  if (prescription !== null) {
    await prescriptionRepository.save({
      ...prescription,
      reminderMode: detalhes.reminderMode,
      notes: detalhes.notes,
      attachmentUri: detalhes.attachmentUri,
      attachmentKind: detalhes.attachmentUri === null ? null : "image",
      attachmentValidUntil: detalhes.attachmentValidUntil,
      ...syncFields(),
    });
  }

  const hasStockInfo =
    detalhes.stockQuantity !== null || detalhes.storageLocation !== null || detalhes.lowStockAlertEnabled;
  if (!hasStockInfo || prescription === null) return;

  const inventoryRepository = new InventoryRepository();
  const existing = await inventoryRepository.findByMedication(ids.medicationId);
  await inventoryRepository.save({
    id: existing?.id ?? Crypto.randomUUID(),
    medicationId: ids.medicationId,
    quantity: detalhes.stockQuantity ?? 0,
    unit: prescription.doseUnit,
    lowStockAlertEnabled: detalhes.lowStockAlertEnabled,
    lowStockAlertLeadDays: detalhes.lowStockAlertEnabled ? detalhes.lowStockAlertLeadDays : null,
    storageLocation: detalhes.storageLocation,
    ...syncFields(),
  });
}
