import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { gravarDesfecho } from "./use-today-doses";

const persistsLocally = Platform.OS !== "web";

export type DoseDoHorario = {
  doseScheduleId: string;
  medicationId: string;
  medicationName: string;
  /**
   * A foto da caixa, quando existe.
   *
   * A tela do alarme já a mostrava, e aqui ela faltava — mas esta tela é justamente o destino do
   * "Ver e confirmar no app" quando há quatro ou mais remédios no mesmo horário, que é o caso em
   * que reconhecer a caixa mais ajuda. Ler quatro nomes parecidos é mais lento que ver quatro
   * caixas.
   */
  photoUri: string | null;
  quantidadeFormatada: string;
  amount: number;
  /** Orientação de como tomar, quando houver — "com bastante água". */
  intakeNote: string | null;
  /**
   * Onde a caixa está guardada, quando o estoque diz.
   *
   * Vem do inventário, como na tela do alarme. Esta tela é o destino do toque na notificação e do
   * "Ver e confirmar no app": quem chega aqui vai **buscar** o remédio, e dizer onde ele está é a
   * diferença entre levantar uma vez e procurar pela casa.
   */
  storageLocation: string | null;
  /**
   * A observação livre do tratamento, quando houver.
   *
   * Diferente de `intakeNote`, que acompanha a dose ("em jejum"): esta é o que o paciente anotou
   * sobre o tratamento como um todo. Pedido do Gabriel em 12/09 — na tela onde a dose se confirma,
   * tudo o que ele cadastrou precisa estar visível, porque é ali que a informação vira orientação.
   */
  notes: string | null;
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
  resolvida: boolean;
};

/**
 * As doses de um horário — o destino do toque na notificação.
 *
 * É aqui que a **resposta parcial** cabe: o botão da notificação só sabe dizer "tomei todas",
 * porque um rótulo curto não consegue distinguir dois remédios. Quem tomou um e não o outro abre
 * esta tela e responde um por um.
 *
 * A tela também abre sem notificação nenhuma, pela agenda — e aí é a mesma tela, sem destaque.
 */
export function useDosesDoHorario(instanteIso: string) {
  const [doses, setDoses] = useState<DoseDoHorario[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) {
      setLoading(false);
      return;
    }

    try {
      // A janela é o minuto exato do horário: as doses de um aviso compartilham o instante, e é
      // esse instante que a notificação carrega.
      const inicio = new Date(instanteIso);
      const fim = new Date(inicio.getTime() + 60_000);

      const [comStatus, prescriptions, medications, inventories] = await Promise.all([
        new DoseScheduleRepository().findBetween(inicio.toISOString(), fim.toISOString()),
        new PrescriptionRepository().findAll(),
        new MedicationRepository().findAll(),
        // Só pelo `storageLocation`, como na tela do alarme: a quantidade em estoque não entra
        // aqui, que é tela de responder dose e não de conferir caixa.
        new InventoryRepository().findAll(),
      ]);

      const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
      const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));
      const estoquePorMedicamento = new Map(inventories.map((i) => [i.medicationId, i]));

      const encontradas: DoseDoHorario[] = [];
      for (const { doseSchedule, latestStatus, latestLogId } of comStatus) {
        const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
        const medication = prescription && medicamentoPorId.get(prescription.medicationId);
        if (!prescription || !medication) continue;

        encontradas.push({
          doseScheduleId: doseSchedule.id,
          medicationId: medication.id,
          medicationName: medication.name,
          photoUri: medication.photoUri,
          quantidadeFormatada: formatarQuantidade(doseSchedule.amount, prescription.doseUnit),
          amount: doseSchedule.amount,
          intakeNote: prescription.intakeNote,
          storageLocation: estoquePorMedicamento.get(medication.id)?.storageLocation ?? null,
          notes: prescription.notes,
          latestStatus,
          latestLogId,
          resolvida: resolvesDose(latestStatus),
        });
      }

      encontradas.sort((a, b) => a.medicationName.localeCompare(b.medicationName));
      setDoses(encontradas);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar as doses.");
    } finally {
      setLoading(false);
    }
  }, [instanteIso]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const registrar = useCallback(
    async (dose: DoseDoHorario, status: IntakeStatus) => {
      await gravarDesfecho(dose, status);
      await reload();
      // Resolvida, a dose deixa de gerar aviso — e o horário some da fila se não sobrar nenhuma.
      await reagendarTodosOsAvisos();
    },
    [reload],
  );

  return { doses, isLoading, error, reload, registrar };
}
