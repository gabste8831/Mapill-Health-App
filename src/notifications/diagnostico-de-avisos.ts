import notifee, { AuthorizationStatus, AndroidNotificationSetting } from "react-native-notify-kit";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import { diaEMesDoIso } from "@/shared/datas-por-extenso";
import { estimateStockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import { planejarAvisosDeCompromisso } from "@/domain/use-cases/planejar-avisos-de-compromisso";
import { planejarAvisosDeEstoque } from "@/domain/use-cases/planejar-avisos-de-estoque";
import type { PosologyUnit } from "@/domain/entities/medication";

export type AvisoAgendado = {
  id: string;
  quando: string | null;
  /** `alarme:` no id: abre a tela cheia em vez de so notificar. */
  ehAlarme: boolean;
  titulo: string | null;
};

export type EstadoDeUmCanal = {
  id: string;
  nome: string;
  /** 0 a 5. Abaixo de 4 o Android nao mostra heads-up nem toca som. */
  importancia: number;
  som: string | null;
  /**
   * A URI que o Android resolveu para o som.
   *
   * `sound` sozinho engana: pedindo `"default"`, o Android guarda a URI e pode devolver `sound`
   * vazio. Mudo de verdade e quando as duas estao vazias.
   */
  somUri: string | null;
  bloqueado: boolean;
};

export type DiagnosticoDeAvisos = {
  agendados: AvisoAgendado[];
  canais: EstadoDeUmCanal[];
  permissaoDeNotificar: "concedida" | "negada" | "nao-perguntada";
  alarmeExato: boolean;
  /**
   * Negada, o Android rebaixa todo `fullScreenAction` para heads-up, e a tela azul passa a depender
   * do caminho JavaScript, que so age com o app em primeiro plano.
   *
   * Nao vira linha de permissao no painel: a tela de destino nao existe em todo aparelho.
   */
  telaCheia: boolean;
  /** Separados por tipo: saber qual falhou e metade do diagnostico. */
  esperados: {
    doses: number;
    compromissos: number;
    receitas: number;
    estoques: number;
  };
  geradoEm: Date;
};

const PREFIXO_DE_ALARME = "alarme:";

/**
 * Fotografa o estado real do subsistema de avisos.
 *
 * Testar alarme e caro, e quando nao toca ha meia duzia de causas possiveis sem como distinguir
 * entre elas. Isto responde antes de esperar: um alarme que nao aparece aqui nunca ia tocar.
 *
 * Le tudo do sistema e do banco, sem estado proprio: um diagnostico que depende do proprio registro
 * mente junto com o defeito que deveria encontrar.
 */
export async function diagnosticarAvisos(): Promise<DiagnosticoDeAvisos> {
  const geradoEm = new Date();

  if (Platform.OS !== "android") {
    return {
      agendados: [],
      canais: [],
      permissaoDeNotificar: "nao-perguntada",
      alarmeExato: false,
      telaCheia: false,
      esperados: { doses: 0, compromissos: 0, receitas: 0, estoques: 0 },
      geradoEm,
    };
  }

  const [pendentes, canaisDoSistema, configuracoes] = await Promise.all([
    notifee.getTriggerNotifications(),
    notifee.getChannels(),
    notifee.getNotificationSettings(),
  ]);

  const agendados: AvisoAgendado[] = pendentes
    .map(({ notification, trigger }) => {
      const comHorario = trigger as { timestamp?: number };
      const timestamp = typeof comHorario.timestamp === "number" ? comHorario.timestamp : null;
      return {
        id: notification.id ?? "(sem id)",
        quando: timestamp === null ? null : new Date(timestamp).toLocaleString("pt-BR"),
        ehAlarme: (notification.id ?? "").startsWith(PREFIXO_DE_ALARME),
        titulo: notification.title ?? null,
        // Guardado só para ordenar; não sai no tipo público.
        _ordem: timestamp ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((a, b) => a._ordem - b._ordem)
    .map(({ _ordem, ...aviso }) => aviso);

  const canais: EstadoDeUmCanal[] = canaisDoSistema.map((canal) => ({
    id: canal.id,
    nome: canal.name,
    importancia: canal.importance ?? 0,
    som: canal.sound ?? null,
    somUri: canal.soundURI ?? null,
    bloqueado: canal.blocked === true,
  }));

  const permissaoDeNotificar =
    configuracoes.authorizationStatus === AuthorizationStatus.AUTHORIZED
      ? "concedida"
      : configuracoes.authorizationStatus === AuthorizationStatus.DENIED
        ? "negada"
        : "nao-perguntada";

  return {
    agendados,
    canais,
    permissaoDeNotificar,
    alarmeExato: configuracoes.android.alarm === AndroidNotificationSetting.ENABLED,
    telaCheia:
      configuracoes.android.fullScreenIntent === undefined ||
      configuracoes.android.fullScreenIntent === AndroidNotificationSetting.ENABLED,
    esperados: await contarEsperados(),
    geradoEm,
  };
}

/**
 * Quantos avisos deveriam existir, contando do banco.
 *
 * O que importa e a comparacao: dez doses e zero agendados e defeito de agendamento; dez e dez, com
 * o alarme mudo, e defeito de entrega.
 */
async function contarEsperados(): Promise<{
  doses: number;
  compromissos: number;
  receitas: number;
  estoques: number;
}> {
  const agora = new Date();
  const ate = new Date(agora.getTime() + 7 * 24 * 60 * 60_000);

  const [comStatus, prescriptions, medications, appointments, inventories] = await Promise.all([
    new DoseScheduleRepository().findBetween(agora.toISOString(), ate.toISOString()),
    new PrescriptionRepository().findAll(),
    new MedicationRepository().findAll(),
    new AppointmentRepository().findAll(),
    new InventoryRepository().findAll(),
  ]);

  const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
  const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

  // So as que de fato geram aviso: contar todas faria a comparacao acusar defeito onde nao ha.
  const doses = comStatus.filter(({ doseSchedule, latestStatus }) => {
    if (latestStatus === "confirmed" || latestStatus === "skipped") return false;
    const prescription = prescricaoPorId.get(doseSchedule.prescriptionId);
    if (!prescription || prescription.reminderMode === "none") return false;
    return medicamentoPorId.has(prescription.medicationId);
  }).length;

  const compromissos = appointments.filter((appointment) => {
    if (appointment.outcome !== null) return false;
    if (appointment.scheduledFor < agora.toISOString()) return false;
    return appointment.reminderLeadDays !== null || appointment.reminderOnDay;
  }).length;

  /**
   * Receita e estoque contam pelos proprios planejadores, e nao por um filtro escrito aqui: as duas
   * regras tem ramificacoes que um filtro simples erraria, e o diagnostico passaria a discordar do
   * agendador no dia em que elas mudassem.
   */
  const receitas = planejarAvisosDeCompromisso({
    compromissos: [],
    receitas: prescriptions.flatMap((prescription) => {
      const medication = medicamentoPorId.get(prescription.medicationId);
      if (medication === undefined) return [];
      if (prescription.attachmentValidUntil === null) return [];
      return [
        {
          prescriptionId: prescription.id,
          medicationName: medication.name,
          validUntil: prescription.attachmentValidUntil,
          querAviso: prescription.renewalReminderEnabled,
          renewalReminderLeadDays: prescription.renewalReminderLeadDays,
        },
      ];
    }),
    agora,
    ate,
  }).length;

  const estoques = planejarAvisosDeEstoque({
    estoques: inventories.flatMap((inventory) => {
      const medication = medicamentoPorId.get(inventory.medicationId);
      if (medication === undefined) return [];
      if (!inventory.lowStockAlertEnabled) return [];

      const prescription = prescriptions
        .filter((p) => p.medicationId === inventory.medicationId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      if (prescription === undefined) return [];

      const depletion = estimateStockDepletion(
        prescription,
        { amount: inventory.quantity, unit: inventory.unit as PosologyUnit },
        agora,
      );
      if (depletion === null) return [];

      return [
        {
          inventoryId: inventory.id,
          medicationName: medication.name,
          diasRestantes: depletion.daysRemaining,
          ultimoDia: depletion.lastDay,
          ultimoDiaFormatado: diaEMesDoIso(depletion.lastDay),
          querAviso: inventory.lowStockAlertEnabled,
          avisoLeadDays: inventory.lowStockAlertLeadDays,
          quantidadeQuandoAvisou: inventory.lowStockAlertedAtQuantity,
          quantidadeAtual: inventory.quantity,
        },
      ];
    }),
    agora,
    ate,
  }).length;

  return { doses, compromissos, receitas, estoques };
}
