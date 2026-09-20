import { useCallback, useEffect, useState } from "react";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import { ouvirDosesResolvidas } from "@/notifications/doses-resolvidas";
import { formatarOrientacoes } from "@/shared/orientacoes-de-tomada";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { gravarDesfecho } from "./use-today-doses";

export type DoseDoAlarme = {
  doseScheduleId: string;
  medicationId: string;
  medicationName: string;
  /** Reconhecer a caixa e mais rapido que ler o nome, ainda mais recem-acordado. */
  photoUri: string | null;
  /** O alarme e o unico momento em que saber onde a caixa esta guardada vale de verdade. */
  storageLocation: string | null;
  quantidadeFormatada: string;
  amount: number;
  orientacoes: string[];
  intakeNote: string | null;
  notes: string | null;
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
  resolvida: boolean;
  /** A trava e de um adiamento por horario; a tela esconde o botao em vez de oferecer e recusar. */
  snoozeCount: number;
};

/**
 * As doses de um horario para a tela de alarme, que vive fora do roteador.
 *
 * Nao reusa o `use-doses-do-horario` porque aquele recarrega com `useFocusEffect`, que depende de
 * haver rota em foco. Esta tela e montada por `AppRegistry`, fora da arvore de navegacao: ali o
 * `useFocusEffect` nunca dispara, e a recarga vem por intervalo e por anuncio.
 */
export function useDosesDoAlarme(instanteIso: string) {
  const [doses, setDoses] = useState<DoseDoAlarme[]>([]);
  const [isLoading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      /**
       * A janela e o minuto inteiro, alinhado.
       *
       * As doses nascem em `:00.000`, mas o instante que a notificacao carrega pode trazer segundos
       * porque o piso do gatilho empurra a dose vencida para "agora + 1s". Ancorada no instante
       * cru, a janela comecava depois da dose que a originou e a tela subia vazia.
       */
      const inicio = new Date(instanteIso);
      inicio.setSeconds(0, 0);
      const fim = new Date(inicio.getTime() + 60_000);

      const [comStatus, prescriptions, medications, inventories] = await Promise.all([
        new DoseScheduleRepository().findBetween(inicio.toISOString(), fim.toISOString()),
        new PrescriptionRepository().findAll(),
        new MedicationRepository().findAll(),
        // Só pelo `storageLocation`: a quantidade em estoque não entra na tela de alarme, que
        // pergunta "você tomou?" e não "quanto ainda resta?".
        new InventoryRepository().findAll(),
      ]);

      const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
      const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));
      const estoquePorMedicamento = new Map(inventories.map((i) => [i.medicationId, i]));

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
          storageLocation: estoquePorMedicamento.get(medication.id)?.storageLocation ?? null,
          quantidadeFormatada: formatarQuantidade(doseSchedule.amount, prescription.doseUnit),
          amount: doseSchedule.amount,
          orientacoes: formatarOrientacoes(prescription.intakeInstructions),
          intakeNote: prescription.intakeNote,
          notes: prescription.notes,
          snoozeCount: doseSchedule.snoozeCount,
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
      // ali - silenciar e sair seguem funcionando, que é o mínimo que esta tela deve garantir.
      setLoading(false);
    }
  }, [instanteIso]);

  /**
   * Carrega ao montar e a cada tres segundos enquanto o alarme esta na tela.
   *
   * A dose pode ser resolvida em outro lugar enquanto o alarme toca: pelo botao da notificacao, ou
   * pela Home em outro aparelho. Sem revalidar, a tela seguia oferecendo "Tomei" para o que ja
   * fora confirmado, com o alarme tocando depois de respondido.
   */
  useEffect(() => {
    void carregar();
    const intervalo = setInterval(() => void carregar(), 3_000);
    // O anuncio fecha a janela que o intervalo deixa aberta; o intervalo fica como rede para o caso
    // de esta tela ter montado depois da gravacao.
    const pararDeOuvir = ouvirDosesResolvidas(() => void carregar());
    return () => {
      clearInterval(intervalo);
      pararDeOuvir();
    };
  }, [carregar]);

  const registrar = useCallback(
    async (dose: DoseDoAlarme, status: IntakeStatus) => {
      await gravarDesfecho(dose, status);
      // Reflete na hora, sem esperar a próxima revalidação: quem acabou de responder precisa ver a
      // linha sair da lista, e é o que decide se a tela ainda tem o que perguntar.
      await carregar();
    },
    [carregar],
  );

  return { doses, isLoading, registrar };
}
