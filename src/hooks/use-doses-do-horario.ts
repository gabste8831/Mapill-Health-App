import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import { reagendarAvisosDeDose } from "@/notifications/reagendar-avisos";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { gravarDesfecho } from "./use-today-doses";

const persistsLocally = Platform.OS !== "web";

export type DoseDoHorario = {
  doseScheduleId: string;
  medicationId: string;
  medicationName: string;
  quantidadeFormatada: string;
  amount: number;
  /** Orientação de como tomar, quando houver — "com bastante água". */
  intakeNote: string | null;
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

      const [comStatus, prescriptions, medications] = await Promise.all([
        new DoseScheduleRepository().findBetween(inicio.toISOString(), fim.toISOString()),
        new PrescriptionRepository().findAll(),
        new MedicationRepository().findAll(),
      ]);

      const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
      const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

      const encontradas: DoseDoHorario[] = [];
      for (const { doseSchedule, latestStatus, latestLogId } of comStatus) {
        const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
        const medication = prescription && medicamentoPorId.get(prescription.medicationId);
        if (!prescription || !medication) continue;

        encontradas.push({
          doseScheduleId: doseSchedule.id,
          medicationId: medication.id,
          medicationName: medication.name,
          quantidadeFormatada: formatarQuantidade(doseSchedule.amount, prescription.doseUnit),
          amount: doseSchedule.amount,
          intakeNote: prescription.intakeNote,
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
      await reagendarAvisosDeDose();
    },
    [reload],
  );

  return { doses, isLoading, error, reload, registrar };
}
