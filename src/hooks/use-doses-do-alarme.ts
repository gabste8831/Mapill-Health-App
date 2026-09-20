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
  /**
   * A foto da caixa, quando existe. O alarme dispara com a pessoa recém-acordada, e **reconhecer a
   * caixa é mais rápido que ler o nome** - ainda mais para quem toma cinco remédios de nomes
   * parecidos.
   */
  photoUri: string | null;
  /**
   * Onde a caixa está guardada ("armário da cozinha", "na bolsa"), quando preenchido.
   *
   * O alarme é o único momento em que essa informação vale de verdade: quem acorda às 6h para tomar
   * o remédio precisa saber para onde ir, e é justamente aí que ela não está à mão - o campo mora na
   * tela de estoque, que ninguém abre no meio da noite.
   */
  storageLocation: string | null;
  quantidadeFormatada: string;
  amount: number;
  /**
   * As orientações da lista fechada, já em texto ("Em jejum · Com bastante água").
   *
   * **Chegaram à tela do alarme em 14/09.** O campo era gravado no cadastro e não aparecia em tela
   * nenhuma do app - quem marcava "em jejum" preenchia para ninguém. É aqui que ele vale, porque é
   * aqui que a pergunta "esse era em jejum?" acontece, como o próprio tipo já dizia.
   */
  orientacoes: string[];
  intakeNote: string | null;
  /** Observação do paciente sobre o tratamento. Também só chegou ao alarme em 14/09. */
  notes: string | null;
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
  resolvida: boolean;
  /**
   * Quantas vezes este horário já foi adiado - a trava é de **um** por horário.
   *
   * A tela usa isto para esconder o botão de adiar quando ele não teria efeito, em vez de oferecer
   * e recusar: é a mesma regra que governa a ação da notificação (`semAcoesRapidas`).
   */
  snoozeCount: number;
};

/**
 * As doses de um horário, para a **tela de alarme** - que vive fora do roteador.
 *
 * ## Por que não reusa o `use-doses-do-horario`
 *
 * Os dois carregam a mesma coisa, e a duplicação incomoda. Mas aquele recarrega com
 * `useFocusEffect`, que é do `expo-router` e depende de haver uma rota em foco. Esta tela é montada
 * por `AppRegistry`, **fora da árvore de navegação** - ali não existe rota, e o `useFocusEffect`
 * quebra ou nunca dispara.
 *
 * A diferença entre "tela consultada" e "tela que irrompe" é real, e é ela que separa os dois: um
 * recarrega ao voltar ao foco, o outro por intervalo e por anúncio (ver o efeito abaixo), porque
 * aqui não há foco a que voltar.
 */
export function useDosesDoAlarme(instanteIso: string) {
  const [doses, setDoses] = useState<DoseDoAlarme[]>([]);
  const [isLoading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      /**
       * A janela é o **minuto**, alinhado - e o alinhamento é o que a torna à prova de deslocamento.
       *
       * As doses nascem sempre em `:00.000` (a grade é construída a partir de `HH:MM`), mas o
       * instante que a notificação carrega pode trazer segundos: o piso do gatilho empurra o aviso
       * de uma dose vencida para "agora + 1 s". Ancorando a busca no instante cru, a janela começava
       * **depois** da dose que a originou, e a tela subia vazia - o defeito de 15/09.
       *
       * `setSeconds(0, 0)` faz a janela cobrir o minuto inteiro em que a dose está, venha o instante
       * como vier. A correção em `planejar-avisos-de-dose` faz os dois coincidirem de novo; esta
       * aqui é o que impede o mesmo defeito de voltar por um caminho que ninguém previu.
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
   * Carrega ao montar **e a cada poucos segundos enquanto o alarme está na tela**.
   *
   * A tela não recarrega por foco (não há rota a que voltar), mas ela fica aberta tocando enquanto
   * a pessoa decide - e nesse intervalo a dose pode ser resolvida em outro lugar: pelo botão da
   * notificação, que continua na bandeja, ou pela Home em outro aparelho depois de sincronizar.
   *
   * Sem revalidar, a tela seguia mostrando a dose como pendente e oferecendo "Tomei" para o que já
   * fora confirmado - e o alarme continuava tocando depois de respondido, que é o oposto do que ele
   * promete.
   *
   * Três segundos: rápido o bastante para o alarme sumir logo após a confirmação, e uma consulta
   * local a cada três segundos não pesa numa tela que vive minutos, não horas.
   */
  useEffect(() => {
    void carregar();
    const intervalo = setInterval(() => void carregar(), 3_000);
    /**
     * O anúncio fecha a janela que o intervalo deixa aberta.
     *
     * Confirmar a dose pela tela do horário - aberta pelo corpo da notificação, enquanto o alarme
     * toca - resolvia o registro, mas o som continuava até a próxima revalidação. Alguns segundos
     * de alarme depois de respondido leem como defeito, e é o que o teste em aparelho apontou.
     *
     * O intervalo fica como rede: se o anúncio se perder (esta tela montou depois da gravação),
     * a revalidação ainda corrige.
     */
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
