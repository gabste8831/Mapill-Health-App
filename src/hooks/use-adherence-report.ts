import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import {
  listarDosesPerdidas,
  resumirAdesao,
  type DosePerdida,
  type DoseDoPeriodo,
  type ResumoDeAdesao,
} from "@/domain/use-cases/resumir-adesao";

const persistsLocally = Platform.OS !== "web";

/**
 * Os períodos que a tela oferece, em dias.
 *
 * Três, e não um seletor de datas: escolher "de 12/07 a 09/08" é trabalho, e ninguém tem essa
 * pergunta. As perguntas reais são "como foi esta semana", "como foi o mês" e "como tem sido" — e
 * 7, 30 e 90 dias as respondem. Noventa é o limite útil: além disso a agenda de doses do banco
 * começa a ficar incompleta para quem instalou o app há pouco.
 */
export const PERIODOS_DE_ADESAO = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
] as const;

export type PeriodoDeAdesao = (typeof PERIODOS_DE_ADESAO)[number]["dias"];

const RESUMO_VAZIO: ResumoDeAdesao = {
  previstas: 0,
  confirmadas: 0,
  puladas: 0,
  semResposta: 0,
  taxa: null,
  porMedicamento: [],
};

/** Quantas doses perdidas a tela lista antes de resumir o resto. */
const MAX_PERDIDAS_LISTADAS = 30;

/**
 * O relatório de adesão de um período.
 *
 * Lê o mesmo `findBetween` que a Home e o calendário usam — não há consulta nova nem tabela nova.
 * O que este hook faz é buscar a janela e entregar ao use-case puro, que é onde a conta mora
 * (§2.3.3: o percentual é calculado por regra testável, e não dentro da tela).
 */
export function useAdherenceReport(periodo: PeriodoDeAdesao) {
  const [resumo, setResumo] = useState<ResumoDeAdesao>(RESUMO_VAZIO);
  const [perdidas, setPerdidas] = useState<DosePerdida[]>([]);
  const [isLoading, setLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) {
      setLoading(false);
      return;
    }

    try {
      const agora = new Date();
      const inicio = new Date(agora.getTime() - periodo * 24 * 60 * 60_000);

      const [comStatus, prescriptions, medications] = await Promise.all([
        new DoseScheduleRepository().findBetween(inicio.toISOString(), agora.toISOString()),
        new PrescriptionRepository().findAll(),
        new MedicationRepository().findAll(),
      ]);

      const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
      const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

      const doses: DoseDoPeriodo[] = [];
      for (const { doseSchedule, latestStatus } of comStatus) {
        const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
        const medication = prescription && medicamentoPorId.get(prescription.medicationId);
        /**
         * Medicamento excluído sai do relatório, e isso é decisão e não descuido.
         *
         * As doses dele continuam no banco como histórico — o registro de que existiram não se
         * apaga. Mas um relatório que some com o remédio e mantém a estatística dele mostraria uma
         * taxa que ninguém consegue explicar: o denominador não bate com nada visível na tela.
         */
        if (!prescription || !medication) continue;

        doses.push({
          doseScheduleId: doseSchedule.id,
          scheduledFor: doseSchedule.scheduledFor,
          medicationId: medication.id,
          medicationName: medication.name,
          latestStatus,
        });
      }

      setResumo(resumirAdesao({ doses, agora }));
      setPerdidas(listarDosesPerdidas({ doses, agora }).slice(0, MAX_PERDIDAS_LISTADAS));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível montar o relatório.");
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { resumo, perdidas, isLoading, error, reload };
}
