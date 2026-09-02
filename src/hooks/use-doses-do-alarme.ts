import { useCallback, useEffect, useState } from "react";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { gravarDesfecho } from "./use-today-doses";

export type DoseDoAlarme = {
  doseScheduleId: string;
  medicationId: string;
  medicationName: string;
  /**
   * A foto da caixa, quando existe. O alarme dispara com a pessoa recém-acordada, e **reconhecer a
   * caixa é mais rápido que ler o nome** — ainda mais para quem toma cinco remédios de nomes
   * parecidos.
   */
  photoUri: string | null;
  quantidadeFormatada: string;
  amount: number;
  intakeNote: string | null;
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
  resolvida: boolean;
};

/**
 * As doses de um horário, para a **tela de alarme** — que vive fora do roteador.
 *
 * ## Por que não reusa o `use-doses-do-horario`
 *
 * Os dois carregam a mesma coisa, e a duplicação incomoda. Mas aquele hook recarrega com
 * `useFocusEffect`, que é do `expo-router` e depende de haver uma rota em foco. A tela de alarme é
 * aberta pelo Notifee como `mainComponent`, **por cima da tela de bloqueio e fora da árvore de
 * navegação** — ali não existe rota, e o `useFocusEffect` quebra ou nunca dispara.
 *
 * Fazer o hook compartilhado tolerar os dois mundos deixaria ambos mais frágeis por um ganho de
 * poucas linhas. A diferença entre "tela consultada" e "tela que irrompe" é real, e ela aparece
 * aqui: este carrega uma vez, na montagem, porque não há para onde voltar o foco.
 *
 * ## E por que não recarrega sozinho
 *
 * A `HorarioScreen` recarrega ao voltar ao foco porque a pessoa pode ter respondido pela Home no
 * meio do caminho. Aqui não há meio do caminho: a tela abre, é respondida e fecha.
 */
export function useDosesDoAlarme(instanteIso: string) {
  const [doses, setDoses] = useState<DoseDoAlarme[]>([]);
  const [isLoading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
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

      const encontradas: DoseDoAlarme[] = [];
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
          latestStatus,
          latestLogId,
          resolvida: resolvesDose(latestStatus),
        });
      }

      encontradas.sort((a, b) => a.medicationName.localeCompare(b.medicationName));
      setDoses(encontradas);
    } finally {
      // Sem estado de erro, e é deliberado: um alarme que disparou não pode virar uma tela de erro
      // sem saída às três da manhã. Falhando a leitura, a lista fica vazia e os botões continuam
      // ali — silenciar e sair seguem funcionando, que é o mínimo que esta tela deve garantir.
      setLoading(false);
    }
  }, [instanteIso]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const registrar = useCallback(
    async (dose: DoseDoAlarme, status: IntakeStatus) => {
      await gravarDesfecho(dose, status);
    },
    [],
  );

  return { doses, isLoading, registrar };
}
