import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { IntakeLogRepository } from "@/data/repositories/intake-log-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { Prescription } from "@/domain/entities/prescription";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import { RegisterIntake } from "@/domain/use-cases/register-intake";
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

/**
 * O que a exclusão precisa saber. `prescriptionId` é opcional porque um medicamento pode ter
 * ficado sem prescrição (cadastro interrompido, ou dado inconsistente vindo de uma sincronização
 * futura) — e nesse caso ele ainda tem que poder sair da lista, senão vira um item que a pessoa
 * vê e não consegue remover.
 */
export type MedicamentoAExcluir = {
  medicationId: string;
  prescriptionId: string | null;
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

  await registrarDosesJaTomadas(draft, prescription, medicationId, from);

  return { medicationId, prescriptionId };
}

/**
 * Grava as doses de hoje que o paciente disse já ter tomado antes de cadastrar (E10).
 *
 * O horário já passou, então `generateDoseSchedules` não o produz para o futuro — o agendamento é
 * recriado aqui, para o dia inteiro, e só os horários marcados são aproveitados. Cada um vira um
 * `DoseSchedule` **mais** um `IntakeLog` confirmado, exatamente como uma dose confirmada pela
 * Home: sem o agendamento, o registro de ingestão apontaria para nada, e o histórico deixaria de
 * fechar com a agenda.
 *
 * `occurredAt` é o horário **agendado**, e não agora: aqui o instante da ingestão é justamente o
 * que se está reconstituindo. É diferente da confirmação pela Home, onde o que o app observou foi
 * a resposta e carimbar o horário previsto inventaria dado (§2.3.3). Aqui a pessoa está dizendo
 * "tomei às 8", e é isso que fica gravado.
 *
 * Passa pelo `RegisterIntake` e não por escrita direta para que o desconto de estoque seja o mesmo
 * — é essa a razão de o E10 existir: sem ele o estoque nasce desalinhado da caixa.
 */
async function registrarDosesJaTomadas(
  draft: MedicamentoDraft,
  prescription: Prescription,
  medicationId: string,
  agora: Date,
): Promise<void> {
  if (draft.dosesJaTomadasHoje.length === 0) return;

  const inicioDeHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioDeAmanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
  const marcados = new Set(draft.dosesJaTomadasHoje);

  const doseScheduleRepository = new DoseScheduleRepository();
  const registerIntake = new RegisterIntake(new IntakeLogRepository(), new InventoryRepository());

  for (const doseSchedule of generateDoseSchedules({
    prescription,
    from: inicioDeHoje,
    until: inicioDeAmanha,
  })) {
    const at = new Date(doseSchedule.scheduledFor);
    const p = (value: number) => String(value).padStart(2, "0");
    if (!marcados.has(`${p(at.getHours())}:${p(at.getMinutes())}`)) continue;

    const doseScheduleId = Crypto.randomUUID();
    await doseScheduleRepository.save({ id: doseScheduleId, ...doseSchedule, ...syncFields() });
    await registerIntake.execute({
      id: Crypto.randomUUID(),
      doseScheduleId,
      medicationId,
      status: "confirmed",
      occurredAt: doseSchedule.scheduledFor,
      amount: doseSchedule.amount,
    });
  }
}

/**
 * Remonta o formulário a partir do que está gravado. É o inverso exato de `salvarMedicamento` —
 * as duas funções precisam andar juntas, e é por isso que moram no mesmo arquivo.
 *
 * `null` quando o medicamento não existe mais (excluído noutra tela, por exemplo).
 */
export async function carregarMedicamento(
  medicationId: string,
): Promise<{ draft: MedicamentoDraft; ids: MedicamentoIds } | null> {
  if (!persistsLocally) return null;

  const medication = await new MedicationRepository().findById(medicationId);
  if (medication === null) return null;

  const prescriptions = await new PrescriptionRepository().findByMedication(medicationId);
  // A mais recente: é a que a listagem mostra, e portanto a que a pessoa tocou pra editar.
  const prescription = prescriptions
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (prescription === undefined) return null;

  const inventory = await new InventoryRepository().findByMedication(medicationId);

  return {
    ids: { medicationId, prescriptionId: prescription.id },
    draft: {
      name: medication.name,
      activeIngredient: medication.activeIngredient,
      form: medication.form,
      prescriptionRequirement: medication.prescriptionRequirement,
      photoUri: medication.photoUri,
      doseAmount: prescription.doseAmount,
      doseUnit: prescription.doseUnit,
      schedule: prescription.schedule,
      startDate: prescription.startDate,
      endDate: prescription.endDate,
      reminderMode: prescription.reminderMode,
      intakeInstructions: prescription.intakeInstructions,
      intakeNote: prescription.intakeNote,
      notes: prescription.notes,
      attachmentUri: prescription.attachmentUri,
      attachmentKind: prescription.attachmentKind,
      attachmentValidUntil: prescription.attachmentValidUntil,
      renewalReminderLeadDays: prescription.renewalReminderLeadDays,
      stockQuantity: inventory?.quantity ?? null,
      // Sem estoque cadastrado não há unidade gravada; a da dose é o palpite honesto, e é o mesmo
      // padrão que o formulário usaria num cadastro novo.
      stockUnit: (inventory?.unit as MedicamentoDraft["stockUnit"]) ?? prescription.doseUnit,
      lowStockAlertEnabled: inventory?.lowStockAlertEnabled ?? false,
      lowStockAlertLeadDays: inventory?.lowStockAlertLeadDays ?? null,
      storageLocation: inventory?.storageLocation ?? null,
      // Sempre vazio na edição: registrar ingestão retroativa é coisa do cadastro novo, e trazer
      // o que foi marcado uma vez faria a mesma dose ser gravada de novo a cada alteração.
      dosesJaTomadasHoje: [],
    },
  };
}

/**
 * Exclui um cadastro inteiro — medicamento, tratamento e estoque.
 *
 * Exclusão **lógica** (`deletedAt`), nunca física, por dois motivos que se somam: o registro de
 * ingestão já gravado aponta pra essa prescrição e viraria órfão, e a sincronização (bloco D1)
 * precisa da linha marcada pra contar ao servidor que ela morreu — linha apagada some sem deixar
 * recado, e voltaria do servidor na sincronização seguinte.
 *
 * A exceção são os horários futuros, apagados de vez pelo mesmo motivo que já valia na edição:
 * dose que nunca chegou a acontecer não é histórico (ver `deleteUpcoming`). Os passados ficam —
 * são a memória de quando a dose era pra ter sido tomada, que é o que o histórico referencia.
 */
export async function excluirMedicamento(ids: MedicamentoAExcluir): Promise<void> {
  if (!persistsLocally) return;

  if (ids.prescriptionId !== null) {
    await new DoseScheduleRepository().deleteUpcoming(ids.prescriptionId, new Date().toISOString());
    await new PrescriptionRepository().softDelete(ids.prescriptionId);
  }

  const inventoryRepository = new InventoryRepository();
  const inventory = await inventoryRepository.findByMedication(ids.medicationId);
  if (inventory !== null) await inventoryRepository.softDelete(inventory.id);

  await new MedicationRepository().softDelete(ids.medicationId);
}
