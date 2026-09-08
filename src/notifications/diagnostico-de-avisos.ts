import notifee, { AuthorizationStatus, AndroidNotificationSetting } from "react-native-notify-kit";
import { Platform } from "react-native";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { AppointmentRepository } from "@/data/repositories/appointment-repository";

/** Um aviso que o sistema operacional diz ter agendado. */
export type AvisoAgendado = {
  id: string;
  /** Quando ele vai disparar, já legível. `null` quando o gatilho não é de horário. */
  quando: string | null;
  /** `alarme:` no id, ou seja: vai abrir a tela cheia em vez de só notificar. */
  ehAlarme: boolean;
  /** O que o aviso diz — para conferir de relance se é o remédio certo. */
  titulo: string | null;
};

export type EstadoDeUmCanal = {
  id: string;
  nome: string;
  /** 0 a 5. Abaixo de 4 o Android não mostra heads-up nem toca som. */
  importancia: number;
  /** O nome do recurso, como foi pedido na criação. `null` quando o sistema não devolve. */
  som: string | null;
  /**
   * A URI que o Android **resolveu** para esse som, e é ela que diz se o canal toca.
   *
   * As duas coisas existem porque `sound` sozinho engana: pedindo `"default"`, o Android guarda a
   * URI do som padrão e pode devolver `sound` vazio — o canal toca, e o diagnóstico dizia "MUDO".
   * Um canal mudo de verdade vem com **as duas** vazias.
   *
   * É a terceira vez que a palavra "default" confunde a leitura neste projeto (ver o topo de
   * `canais-notifee.ts`). Mostrar o valor resolvido é o que tira a resposta do campo do palpite.
   */
  somUri: string | null;
  /** Se a pessoa desligou o canal nas configurações do sistema. */
  bloqueado: boolean;
};

export type DiagnosticoDeAvisos = {
  /** O que o sistema tem agendado agora, ordenado pelo mais próximo. */
  agendados: AvisoAgendado[];
  canais: EstadoDeUmCanal[];
  permissaoDeNotificar: "concedida" | "negada" | "nao-perguntada";
  /** Se o app pode agendar alarme exato. Sem isso o horário escorrega. */
  alarmeExato: boolean;
  /** Quantas doses e compromissos deveriam ter aviso na janela — o número esperado. */
  esperados: {
    doses: number;
    compromissos: number;
  };
  geradoEm: Date;
};

const PREFIXO_DE_ALARME = "alarme:";

/**
 * Fotografa o estado real do subsistema de avisos.
 *
 * ## Por que isto existe
 *
 * Testar alarme é caro: exige esperar o horário, bloquear o aparelho, às vezes reiniciar. Quando
 * não toca, a pergunta que fica é *por quê* — e havia meia dúzia de respostas possíveis (não foi
 * agendado, foi agendado errado, o canal está mudo, falta permissão, o Android matou), sem como
 * distinguir entre elas. Cada teste virava uma sessão de adivinhação.
 *
 * Isto responde antes de esperar: mostra o que **está agendado neste instante**, com que horário,
 * em que canal, e compara com quantos avisos deveriam existir. Um alarme que não aparece aqui nunca
 * ia tocar, e isso se descobre em cinco segundos em vez de vinte minutos.
 *
 * Lê tudo do sistema operacional e do banco — não guarda estado próprio, porque um diagnóstico que
 * depende do próprio registro mente junto com o defeito que deveria encontrar.
 */
export async function diagnosticarAvisos(): Promise<DiagnosticoDeAvisos> {
  const geradoEm = new Date();

  if (Platform.OS !== "android") {
    return {
      agendados: [],
      canais: [],
      permissaoDeNotificar: "nao-perguntada",
      alarmeExato: false,
      esperados: { doses: 0, compromissos: 0 },
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
    // As duas leituras, porque só as duas juntas decidem: `sound` é o que pedimos, `soundURI` é o
    // que o Android resolveu. Mudo de verdade é quando **ambas** estão vazias.
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
    esperados: await contarEsperados(),
    geradoEm,
  };
}

/**
 * Quantos avisos **deveriam** existir, contando do banco.
 *
 * O número que importa não é o absoluto, é a comparação: dez doses na janela e zero avisos
 * agendados é um defeito de agendamento; dez e dez, com o alarme não tocando, é defeito de entrega.
 * São causas diferentes, e sem os dois números o teste não distingue.
 */
async function contarEsperados(): Promise<{ doses: number; compromissos: number }> {
  const agora = new Date();
  const ate = new Date(agora.getTime() + 7 * 24 * 60 * 60_000);

  const [comStatus, prescriptions, medications, appointments] = await Promise.all([
    new DoseScheduleRepository().findBetween(agora.toISOString(), ate.toISOString()),
    new PrescriptionRepository().findAll(),
    new MedicationRepository().findAll(),
    new AppointmentRepository().findAll(),
  ]);

  const prescricaoPorId = new Map(prescriptions.map((p) => [p.id, p]));
  const medicamentoPorId = new Map(medications.map((m) => [m.id, m]));

  /**
   * Só as doses que de fato geram aviso: com prescrição e medicamento vivos, ainda não resolvidas,
   * e com lembrete pedido. Contar todas daria um número maior que o correto e faria a comparação
   * acusar defeito onde não há.
   */
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

  return { doses, compromissos };
}
