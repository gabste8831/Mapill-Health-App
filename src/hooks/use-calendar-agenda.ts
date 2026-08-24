import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import type { Appointment } from "@/domain/entities/appointment";
import { resolvesDose, type IntakeStatus } from "@/domain/entities/intake-log";
import type { PosologyUnit } from "@/domain/entities/medication";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import { gravarDesfecho } from "@/hooks/use-today-doses";
import { toLocalIsoDay } from "@/shared/date-input";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

const DIA_EM_MS = 24 * 60 * 60_000;

/**
 * Quanto o calendário olha para trás e para frente.
 *
 * O passado é curto porque a agenda serve para se organizar, não para navegar no histórico — esse
 * é o papel do relatório de adesão (D2). O futuro é longo porque tratamento com prazo e consulta
 * marcada moram lá, e uma agenda que acaba em 30 dias não responde "quando é meu retorno".
 */
const DIAS_PARA_TRAS = 30;
const DIAS_PARA_FRENTE = 90;

/**
 * Uma dose no calendário.
 *
 * `doseScheduleId: null` marca a **projetada**: além dos 30 dias que o app grava de fato
 * (`SCHEDULE_HORIZON_DAYS`), os horários são calculados na hora a partir da posologia, com a mesma
 * função pura que gera os reais. Sem isso a agenda apareceria vazia a partir do dia 31, o que leria
 * como "não tenho remédio em outubro" — mentira silenciosa, que é o modo de falha que este app
 * evita a qualquer custo. Projetada não se confirma: não existe registro para apontar.
 */
export type DoseDaAgenda = {
  doseScheduleId: string | null;
  scheduledFor: string;
  /** `HH:MM` local. */
  time: string;
  medicationId: string;
  medicationName: string;
  amount: number;
  doseUnit: PosologyUnit;
  latestStatus: IntakeStatus | null;
  latestLogId: string | null;
};

export type DiaDaAgenda = {
  /** ISO `YYYY-MM-DD` local. */
  isoDay: string;
  compromissos: Appointment[];
  doses: DoseDaAgenda[];
};

const AGENDA_VAZIA: DiaDaAgenda[] = [];

/** `2026-08-22T14:30:00.000Z` → `"14:30"` no fuso do aparelho. */
function horaLocal(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const p = (value: number) => String(value).padStart(2, "0");
  return `${p(date.getHours())}:${p(date.getMinutes())}`;
}

/**
 * A agenda completa: compromissos e doses, agrupados pelo dia em que acontecem.
 *
 * As duas coisas na mesma lista porque é assim que o dia acontece — quem tem consulta às 14h e
 * dose às 14h30 precisa ver isso junto, e não em duas telas que nunca se cruzam.
 */
async function carregarAgenda(agora: Date): Promise<DiaDaAgenda[]> {
  const inicio = new Date(agora.getTime() - DIAS_PARA_TRAS * DIA_EM_MS);
  const fim = new Date(agora.getTime() + DIAS_PARA_FRENTE * DIA_EM_MS);

  const [compromissos, armazenadas, prescriptions, medications] = await Promise.all([
    new AppointmentRepository().findAllOrderedByDate(),
    new DoseScheduleRepository().findBetween(inicio.toISOString(), fim.toISOString()),
    new PrescriptionRepository().findAll(),
    new MedicationRepository().findAll(),
  ]);

  const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
  const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

  const doses: DoseDaAgenda[] = [];
  /** Até onde cada prescrição já tem horário gravado — é daí que a projeção começa. */
  const ultimoGravado = new Map<string, string>();

  for (const { doseSchedule, latestStatus, latestLogId } of armazenadas) {
    const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
    const medication = prescription && medicamentoPorId.get(prescription.medicationId);
    // Prescrição ou medicamento excluídos: o horário passado continua no banco (é histórico), mas
    // não há o que mostrar na agenda.
    if (!prescription || !medication) continue;

    const anterior = ultimoGravado.get(prescription.id);
    if (anterior === undefined || doseSchedule.scheduledFor > anterior) {
      ultimoGravado.set(prescription.id, doseSchedule.scheduledFor);
    }

    doses.push({
      doseScheduleId: doseSchedule.id,
      scheduledFor: doseSchedule.scheduledFor,
      time: horaLocal(doseSchedule.scheduledFor),
      medicationId: medication.id,
      medicationName: medication.name,
      amount: doseSchedule.amount,
      doseUnit: prescription.doseUnit,
      latestStatus,
      latestLogId,
    });
  }

  // A projeção começa depois do último horário gravado de cada prescrição, nunca antes de agora —
  // senão ela duplicaria o que já veio do banco.
  for (const prescription of prescriptions) {
    const medication = medicamentoPorId.get(prescription.medicationId);
    if (medication === undefined) continue;

    const gravadoAte = ultimoGravado.get(prescription.id);
    const desde = new Date(
      Math.max(gravadoAte === undefined ? agora.getTime() : new Date(gravadoAte).getTime() + 1, agora.getTime()),
    );
    if (desde >= fim) continue;

    for (const projetada of generateDoseSchedules({ prescription, from: desde, until: fim })) {
      doses.push({
        doseScheduleId: null,
        scheduledFor: projetada.scheduledFor,
        time: horaLocal(projetada.scheduledFor),
        medicationId: medication.id,
        medicationName: medication.name,
        amount: projetada.amount,
        doseUnit: prescription.doseUnit,
        latestStatus: null,
        latestLogId: null,
      });
    }
  }

  const porDia = new Map<string, DiaDaAgenda>();
  function diaDe(isoDay: string): DiaDaAgenda {
    const existente = porDia.get(isoDay);
    if (existente !== undefined) return existente;
    const novo: DiaDaAgenda = { isoDay, compromissos: [], doses: [] };
    porDia.set(isoDay, novo);
    return novo;
  }

  for (const compromisso of compromissos) {
    const quando = new Date(compromisso.scheduledFor);
    // Compromisso fora da janela ainda aparece: consulta marcada para daqui a seis meses é
    // exatamente o que alguém abre a agenda para conferir.
    diaDe(toLocalIsoDay(quando)).compromissos.push(compromisso);
  }

  for (const dose of doses) {
    diaDe(toLocalIsoDay(new Date(dose.scheduledFor))).doses.push(dose);
  }

  return Array.from(porDia.values())
    .map((dia) => ({
      ...dia,
      compromissos: dia.compromissos.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
      doses: dia.doses.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
    }))
    .sort((a, b) => a.isoDay.localeCompare(b.isoDay));
}

/**
 * A agenda do calendário, recarregada no foco da tela — é o que faz um compromisso ou remédio
 * recém-cadastrado já estar lá quando o formulário fecha.
 */
export function useCalendarAgenda() {
  const [dias, setDias] = useState<DiaDaAgenda[]>(AGENDA_VAZIA);
  const [isLoading, setIsLoading] = useState(persistsLocally);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!persistsLocally) return;
    try {
      setDias(await carregarAgenda(new Date()));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar sua agenda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  /**
   * Confirmar ou pular uma dose direto do calendário, pelo **mesmo** caminho da Home
   * (`gravarDesfecho`): registro clínico com duas implementações divergiria, e a auditoria do
   * histórico é o que o TCC mede.
   *
   * Só as reais — uma dose projetada não tem registro para apontar.
   */
  const registrarDose = useCallback(
    async (dose: DoseDaAgenda, status: IntakeStatus) => {
      if (!persistsLocally || dose.doseScheduleId === null) return;
      await gravarDesfecho(
        {
          doseScheduleId: dose.doseScheduleId,
          medicationId: dose.medicationId,
          amount: dose.amount,
          latestLogId: dose.latestLogId,
        },
        status,
      );
      await reload();
    },
    [reload],
  );

  return { dias, isLoading, error, reload, registrarDose };
}

/** Se a dose já teve desfecho — o que decide se a linha oferece ação ou mostra o resultado. */
export function doseResolvida(dose: DoseDaAgenda): boolean {
  return resolvesDose(dose.latestStatus);
}
