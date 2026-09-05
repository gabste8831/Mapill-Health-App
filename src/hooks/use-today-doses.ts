import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { IntakeLogRepository } from "@/data/repositories/intake-log-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { InventoryItem } from "@/domain/entities/inventory-item";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import type { Medication, PosologyUnit } from "@/domain/entities/medication";
import type { Prescription } from "@/domain/entities/prescription";
import { CorrectIntake } from "@/domain/use-cases/correct-intake";
import { estimateStockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import { RegisterIntake } from "@/domain/use-cases/register-intake";
import { anunciarDosesResolvidas, ouvirDosesResolvidas } from "@/notifications/doses-resolvidas";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import { toLocalIsoDay, todayIsoDate } from "@/shared/date-input";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

/**
 * Como a dose aparece na agenda do dia.
 *
 * `late` é estado próprio, e não uma variação de `pending`, porque é o único que pede ação agora —
 * e a decisão nº11.5 é explícita: dose atrasada nunca vira "pulada" sozinha, ela fica devendo
 * resposta até alguém dar uma.
 *
 * `now` é a dose **na hora**: dentro da janela de tolerância em torno do horário marcado. Sem ele,
 * a dose das 08:00 virava "atrasada" às 08:01 — e chamar de atraso o que está rigorosamente em dia
 * ensina a ignorar o vermelho, que é justamente o oposto do que ele existe para fazer.
 */
export type DoseVisualStatus = "confirmed" | "skipped" | "late" | "now" | "next" | "upcoming";

/**
 * A janela do "na hora", em minutos: **15 antes e 30 depois** do horário marcado.
 *
 * Antes da hora a dose ainda não é para ser tomada, então a folga é curta — só o bastante para quem
 * viu o alerta e foi buscar o copo d'água.
 *
 * Depois do horário a folga é **menor ainda**: cinco minutos, o tempo de confirmar a dose que se
 * está tomando agora. Eram trinta, e o efeito em aparelho foi três doses vencidas em verde ao mesmo
 * tempo, às 19:35, com horários de 19:31 a 19:34 — meia hora de tolerância faz a tela contradizer o
 * relógio que a pessoa tem na mão, e verde é a cor que menos pode enganar num app de medicação,
 * porque é a que diz "está tudo em ordem".
 */
const TOLERANCIA_ANTES_EM_MINUTOS = 15;
const TOLERANCIA_DEPOIS_EM_MINUTOS = 5;

export type DoseDoDia = {
  doseScheduleId: string;
  /** `HH:MM` local do horário agendado. */
  time: string;
  scheduledFor: string;
  medicationId: string;
  medicationName: string;
  amount: number;
  doseUnit: PosologyUnit;
  intakeNote: string | null;
  status: DoseVisualStatus;
  /** Log que registrou o desfecho atual — presente quando a dose já foi resolvida ou adiada. */
  latestLogId: string | null;
  latestStatus: IntakeStatus | null;
};

export type EstoqueBaixo = {
  medication: Medication;
  inventory: InventoryItem;
  /** Dias até o estoque acabar, no ritmo da posologia. `0` = acaba ainda hoje. */
  daysRemaining: number;
};

/** Um dia do mini-gráfico de adesão. `ratio: null` = não havia dose agendada. */
export type DiaDaSemana = {
  label: string;
  ratio: number | null;
  isToday: boolean;
};

export type AgendaDoDia = {
  doses: DoseDoDia[];
  /** Quantas já foram resolvidas (confirmadas ou puladas) — numerador do progresso. */
  resolvidas: number;
  /** Os últimos 7 dias, terminando em hoje. */
  semana: DiaDaSemana[];
  /** Medicamentos cujo estoque acaba dentro da antecedência que o paciente pediu. */
  estoquesBaixos: EstoqueBaixo[];
  /**
   * Quantos remédios têm estoque controlado. Separado de `estoquesBaixos` porque responde outra
   * pergunta: aquele diz o que está acabando, este diz se a tela de estoque tem o que mostrar —
   * e zero é o que faz o acesso a ela desaparecer da Home.
   */
  estoquesControlados: number;
  /** Se existe pelo menos um medicamento cadastrado — separa "dia vazio" de "app vazio". */
  temMedicamentos: boolean;
  /**
   * Quantos tratamentos ativos pediram para ser avisados (`reminderMode` diferente de `none`).
   *
   * Existe para a Home saber se vale avisar que a permissão de notificações está desligada. Sem
   * isso, o aviso apareceria para quem nunca pediu lembrete nenhum — cobrando uma permissão que
   * não muda nada na vida dessa pessoa, que é o jeito mais rápido de ensinar a ignorar avisos.
   */
  tratamentosComLembrete: number;
};

const AGENDA_VAZIA: AgendaDoDia = {
  doses: [],
  resolvidas: 0,
  semana: [],
  estoquesBaixos: [],
  estoquesControlados: 0,
  temMedicamentos: false,
  tratamentosComLembrete: 0,
};

/** Iniciais dos dias, indexadas por `Date.getDay()`. */
const SIGLAS_DOS_DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const DIA_EM_MS = 24 * 60 * 60_000;

/**
 * Os últimos sete dias, do mais antigo até hoje.
 *
 * Dia sem dose agendada fica com `ratio: null` em vez de zero: barra zerada num dia em que não
 * havia nada a tomar leria como falha, e a adesão que o app mostra deixaria de ser sobre adesão.
 */
async function carregarSemana(agora: Date): Promise<DiaDaSemana[]> {
  const inicio = new Date(agora.getTime() - 6 * DIA_EM_MS);
  const porDia = new Map(
    (await new DoseScheduleRepository().findDailyAdherence(toLocalIsoDay(inicio), toLocalIsoDay(agora))).map(
      (linha) => [linha.day, linha],
    ),
  );

  return Array.from({ length: 7 }, (_, indice) => {
    const dia = new Date(inicio.getTime() + indice * DIA_EM_MS);
    const linha = porDia.get(toLocalIsoDay(dia));
    return {
      label: SIGLAS_DOS_DIAS[dia.getDay()],
      ratio: linha === undefined || linha.total === 0 ? null : linha.confirmed / linha.total,
      isToday: indice === 6,
    };
  });
}

/** `2026-08-22T14:30:00.000Z` → `"14:30"` no fuso do aparelho. */
function horaLocal(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const p = (value: number) => String(value).padStart(2, "0");
  return `${p(date.getHours())}:${p(date.getMinutes())}`;
}

async function carregarAgenda(agora: Date): Promise<AgendaDoDia> {
  const [comStatus, prescriptions, medications, inventories, semana] = await Promise.all([
    new DoseScheduleRepository().findForDay(todayIsoDate()),
    new PrescriptionRepository().findAll(),
    new MedicationRepository().findAll(),
    new InventoryRepository().findAll(),
    carregarSemana(agora),
  ]);

  const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
  const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

  const doses: DoseDoDia[] = [];
  for (const { doseSchedule, latestStatus, latestLogId } of comStatus) {
    const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
    const medication = prescription && medicamentoPorId.get(prescription.medicationId);
    // Prescrição ou medicamento excluídos: o horário passado continua no banco (é histórico),
    // mas não há o que mostrar na agenda de hoje.
    if (!prescription || !medication) continue;

    doses.push({
      doseScheduleId: doseSchedule.id,
      time: horaLocal(doseSchedule.scheduledFor),
      scheduledFor: doseSchedule.scheduledFor,
      medicationId: medication.id,
      medicationName: medication.name,
      amount: doseSchedule.amount,
      doseUnit: prescription.doseUnit,
      intakeNote: prescription.intakeNote,
      latestLogId,
      latestStatus,
      // Recalculado logo abaixo: "próxima" depende de quem são as outras.
      status: "upcoming",
    });
  }

  // A primeira pendente é "a próxima"; as pendentes dentro da janela estão "na hora", e as que
  // passaram dela estão atrasadas. As três coisas se decidem olhando a lista inteira, por isso não
  // saem do laço acima.
  const inicioDaJanela = new Date(agora.getTime() + TOLERANCIA_ANTES_EM_MINUTOS * 60_000).toISOString();
  const fimDaJanela = new Date(agora.getTime() - TOLERANCIA_DEPOIS_EM_MINUTOS * 60_000).toISOString();
  let proximaMarcada = false;
  for (const dose of doses) {
    if (resolvesDose(dose.latestStatus)) {
      dose.status = dose.latestStatus === "confirmed" ? "confirmed" : "skipped";
      continue;
    }
    // Passou da tolerância: é atraso de verdade.
    if (dose.scheduledFor < fimDaJanela) {
      dose.status = "late";
      continue;
    }
    // Dentro da janela, dos dois lados do horário: o que ela precisa dizer é que a hora chegou.
    //
    // **Não** marca `proximaMarcada`: "agora" e "próxima" respondem a perguntas diferentes. A dose
    // na hora já está na agenda, em verde, pedindo ação; o card do topo responde "e depois desta,
    // o que vem?". Enquanto uma consumia a outra, ter qualquer dose na janela apagava o card azul
    // da tela inteira — foi o que sumiu com ele quando três doses ficaram "na hora" juntas.
    if (dose.scheduledFor <= inicioDaJanela) {
      dose.status = "now";
      continue;
    }
    dose.status = proximaMarcada ? "upcoming" : "next";
    proximaMarcada = true;
  }

  return {
    doses,
    semana,
    estoquesBaixos: estoquesQueVaoAcabar(inventories, prescriptions, medicamentoPorId, agora),
    // Só os de medicamento que ainda existe: excluído o remédio, o estoque dele fica no banco mas
    // não conta, senão a Home prometeria uma linha que a tela de estoque não mostra.
    estoquesControlados: inventories.filter(
      (inventory) => medicamentoPorId.get(inventory.medicationId) !== undefined,
    ).length,
    resolvidas: doses.filter((dose) => resolvesDose(dose.latestStatus)).length,
    temMedicamentos: medications.length > 0,
    // Só os de medicamento que ainda existe, pelo mesmo motivo do estoque: a prescrição de um
    // remédio excluído continua no banco como histórico, mas não espera aviso nenhum.
    tratamentosComLembrete: prescriptions.filter(
      (prescription) =>
        prescription.reminderMode !== "none" &&
        medicamentoPorId.get(prescription.medicationId) !== undefined,
    ).length,
  };
}

/**
 * Os estoques que merecem aviso agora: os que acabam dentro da antecedência que o próprio
 * paciente escolheu, mais os que já zeraram.
 *
 * O alerta desligado não é ignorado por completo — estoque em zero aparece de qualquer forma,
 * porque aí não é previsão, é o remédio ter acabado.
 */
function estoquesQueVaoAcabar(
  inventories: InventoryItem[],
  prescriptions: Prescription[],
  medicamentoPorId: Map<string, Medication>,
  agora: Date,
): EstoqueBaixo[] {
  const avisos: EstoqueBaixo[] = [];

  for (const inventory of inventories) {
    const medication = medicamentoPorId.get(inventory.medicationId);
    if (medication === undefined) continue;

    if (inventory.quantity <= 0) {
      avisos.push({ medication, inventory, daysRemaining: 0 });
      continue;
    }
    if (!inventory.lowStockAlertEnabled || inventory.lowStockAlertLeadDays === null) continue;

    // A mais recente entre as do medicamento: é a que está valendo, e portanto a que dita o ritmo
    // com que o estoque é consumido.
    const prescription = prescriptions
      .filter((p) => p.medicationId === inventory.medicationId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (prescription === undefined) continue;

    const depletion = estimateStockDepletion(
      prescription,
      { amount: inventory.quantity, unit: inventory.unit as PosologyUnit },
      agora,
    );
    // `null` = não dá pra estimar (sem horário), dura além do horizonte, ou estoque e dose estão
    // em unidades diferentes. Nos três casos não há o que avisar, e inventar um aviso seria pior
    // que ficar calado.
    if (depletion === null) continue;
    if (depletion.daysRemaining > inventory.lowStockAlertLeadDays) continue;

    avisos.push({ medication, inventory, daysRemaining: depletion.daysRemaining });
  }

  return avisos.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Grava o desfecho de uma dose. Quando já existe log — inclusive um "adiar" —, grava uma
 * **correção** em vez de um registro solto: assim o estoque é ajustado pela diferença e o
 * registro anterior continua consultável, que é o que torna o histórico auditável.
 *
 * `occurredAt` é agora, e não o horário agendado, mesmo numa dose atrasada: o que o app tem para
 * registrar é o instante em que a pessoa respondeu. Carimbar o horário previsto seria inventar
 * um dado clínico que ninguém observou (§2.3.3 — o valor do eMEM está justamente no timestamp
 * ser do evento real).
 */
/**
 * O mínimo para registrar um desfecho. Existe como tipo próprio para que o calendário possa
 * registrar pelo mesmo caminho da Home sem carregar tudo que a linha da Home precisa desenhar —
 * duas implementações de registro clínico é o que este tipo existe para evitar.
 */
export type DoseParaRegistrar = {
  doseScheduleId: string;
  medicationId: string;
  amount: number;
  /** Log que registrou o desfecho atual, quando já existe um. */
  latestLogId: string | null;
};

export async function gravarDesfecho(
  dose: DoseParaRegistrar,
  status: IntakeStatus,
): Promise<void> {
  const intakeLogRepository = new IntakeLogRepository();
  const inventoryRepository = new InventoryRepository();
  const occurredAt = new Date().toISOString();

  /**
   * O desfecho atual vem do **banco**, e não do que a tela carregou.
   *
   * `dose.latestLogId` é a memória de quando a tela montou, e entre aquele instante e este toque a
   * dose pode ter sido resolvida em outro lugar — pela notificação, por outra tela, pelo handler de
   * segundo plano. A tela de alarme é o caso extremo: ela carrega uma vez e não recarrega (não há
   * foco a que voltar), então sua cópia envelhece por todo o tempo em que o alarme toca.
   *
   * Confiando na memória, uma dose já confirmada pela notificação era vista como nova aqui, e o
   * `RegisterIntake` gravava uma **segunda** ingestão: o estoque de 10 caía para 8 com uma dose só.
   * Reler é o que faz o segundo caminho reconhecer o primeiro e corrigir em vez de somar.
   */
  const logs = await intakeLogRepository.findByDoseSchedule(dose.doseScheduleId);
  const anterior = logs.at(-1) ?? null;

  /**
   * Repetir o mesmo desfecho não faz nada.
   *
   * Confirmar o que já está confirmado não é uma correção — é o mesmo fato dito duas vezes, e
   * gravá-lo somaria um registro ao histórico que o médico vai ler. Acontece de verdade: o alarme
   * continua tocando depois de a dose ser confirmada pela notificação, e responder na tela é o
   * gesto natural para calar o som.
   *
   * Um desfecho **diferente** segue passando: mudar de "pulei" para "tomei" é correção legítima, e
   * é para isso que o `CorrectIntake` existe.
   */
  if (anterior !== null && anterior.status === status) return;

  if (anterior === null) {
    await new RegisterIntake(intakeLogRepository, inventoryRepository, () =>
      Crypto.randomUUID(),
    ).execute({
      id: Crypto.randomUUID(),
      doseScheduleId: dose.doseScheduleId,
      medicationId: dose.medicationId,
      status,
      occurredAt,
      amount: dose.amount,
    });
    /**
     * Avisa quem estiver mostrando esta dose agora.
     *
     * É a tela de alarme que precisa: ela toca em loop, e continuar tocando depois de a dose ser
     * confirmada em outro lugar — pelo corpo da notificação, que leva à tela do horário — é o app
     * contradizendo o que acabou de gravar. Ela revalida sozinha a cada poucos segundos, mas
     * esses segundos de som depois da resposta leem como defeito.
     *
     * Fica no funil da gravação, e não em cada tela: Home, tela do horário e alarme passam todos
     * por aqui, e anunciar em cada chamador abriria caminho para alguém esquecer.
     */
    anunciarDosesResolvidas([dose.doseScheduleId]);
    return;
  }

  await new CorrectIntake(intakeLogRepository, inventoryRepository, () =>
    Crypto.randomUUID(),
  ).execute({
    id: Crypto.randomUUID(),
    previousLog: anterior,
    medicationId: dose.medicationId,
    newStatus: status,
    occurredAt,
    amount: dose.amount,
  });

  anunciarDosesResolvidas([dose.doseScheduleId]);
}


/**
 * A agenda de hoje, recarregada quando a tela volta ao foco — é o que faz um cadastro feito agora
 * já aparecer, e o que sincroniza a Home com o que foi confirmado na tela de dose.
 */
export function useTodayDoses() {
  const [agenda, setAgenda] = useState<AgendaDoDia>(AGENDA_VAZIA);
  const [isLoading, setIsLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) return;
    try {
      setAgenda(await carregarAgenda(new Date()));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar suas doses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Recarrega ao ganhar foco **e a cada minuto enquanto a tela está aberta**.
   *
   * O status da dose depende da hora que é agora: às 18:15 ela é "É AGORA", às 18:46 é "ATRASADA".
   * Só com `useFocusEffect`, o `agora` congelava no instante em que a tela abriu — quem deixava a
   * Home aberta via a dose presa em verde muito depois de o horário passar, que é justamente a cor
   * que não pode mentir num app de medicação.
   *
   * Um minuto é a menor unidade que a tela mostra, então checar mais que isso não mudaria nada na
   * tela. O intervalo morre junto com o foco: fora dela não há o que redesenhar.
   */
  useFocusEffect(
    useCallback(() => {
      void reload();
      const intervalo = setInterval(() => void reload(), 60_000);
      /**
       * A dose resolvida **em outro lugar** também atualiza a Home, sem esperar o minuto.
       *
       * O `useFocusEffect` cobre o caminho normal — voltar da tela do horário devolve o foco e
       * recarrega. O que ele não cobre é a Home **já em foco** quando algo é confirmado fora dela:
       * o botão da notificação com o app aberto, ou o handler de segundo plano. Aí a tela ficaria
       * mostrando como pendente, por até um minuto, uma dose já registrada — e num app de medicação
       * essa defasagem convida a confirmar de novo.
       *
       * O intervalo continua como rede, para o caso de o anúncio não chegar.
       */
      const pararDeOuvir = ouvirDosesResolvidas(() => void reload());
      return () => {
        clearInterval(intervalo);
        pararDeOuvir();
      };
    }, [reload]),
  );

  const registrarDose = useCallback(
    async (dose: DoseDoDia, status: IntakeStatus) => {
      if (!persistsLocally) return;
      await gravarDesfecho(dose, status);
      await reload();
      // Gatilho nº5 do ciclo de vida: confirmar uma dose antes do horário tem que cancelar o aviso
      // dela, senão o app lembra de um remédio que a pessoa acabou de tomar.
      await reagendarTodosOsAvisos();
    },
    [reload],
  );

  /**
   * Várias doses de uma vez, para quem só voltou ao celular depois — o caso que este atalho existe
   * pra resolver é o das doses atrasadas, não o das futuras.
   *
   * Uma a uma e em sequência, pelo mesmo caminho de `registrarDose`: cada baixa de estoque é um
   * evento somado ao anterior, então gravar em paralelo faria as escritas disputarem a mesma linha
   * de estoque. Recarrega **uma vez** no fim, senão a lista se redesenharia a cada dose e sumiria
   * debaixo do dedo.
   *
   * Devolve os nomes do que não deu certo em vez de abortar no primeiro erro: com metade gravada,
   * parar calado deixaria a pessoa sem saber onde o lote parou.
   */
  const registrarDoses = useCallback(
    async (doses: DoseDoDia[], status: IntakeStatus): Promise<string[]> => {
      if (!persistsLocally) return [];

      const falhas: string[] = [];
      for (const dose of doses) {
        try {
          await gravarDesfecho(dose, status);
        } catch {
          falhas.push(dose.medicationName);
        }
      }

      await reload();
      await reagendarTodosOsAvisos();
      return falhas;
    },
    [reload],
  );

  return { agenda, isLoading, error, reload, registrarDose, registrarDoses };
}
