import * as Crypto from "expo-crypto";

import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { IntakeLogRepository } from "@/data/repositories/intake-log-repository";
import { InventoryRepository } from "@/data/repositories/inventory-repository";
import { MedicationRepository } from "@/data/repositories/medication-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { resolvesDose } from "@/domain/entities/intake-log";
import { RegisterIntake } from "@/domain/use-cases/register-intake";
import { anunciarDosesResolvidas } from "./doses-resolvidas";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { ACAO_ADIAR, ACAO_PULEI, ACAO_TOMEI, MINUTOS_DE_ADIAMENTO } from "./acoes";
import {
  NotifeeGateway,
  PREFIXO_ADIADO,
  type DadosDoAviso,
} from "./notifee-gateway";
import { reagendarTodosOsAvisos } from "./reagendar-avisos";

/**
 * "Tomei" — confirma **todas** as doses do horário e desconta o estoque de cada uma.
 *
 * O botão só existe com esse rótulo ("Tomei todas" quando há mais de uma), então confirmar o
 * conjunto é exatamente o que foi pedido. Resposta parcial não passa por aqui: ela se resolve na
 * tela do horário, aberta ao tocar no corpo da notificação.
 *
 * O `occurredAt` é **agora**, e não o horário agendado: o que o app observou foi a resposta, e
 * carimbar o horário previsto inventaria um dado que ninguém forneceu (§2.3.3 — o registro é de
 * monitoramento eletrônico, e ele vale por ser fiel ao que aconteceu de fato).
 */
export async function confirmarDosesDoAviso(
  doseScheduleIds: string[],
  /**
   * O desfecho a gravar. `confirmed` desconta o estoque; `skipped` só registra.
   *
   * O parâmetro entrou quando a notificação ganhou o botão "Pulei": as duas respostas percorrem
   * exatamente o mesmo caminho — mesma guarda contra repetição, mesmo anúncio, mesmo reagendamento
   * —, e a única diferença é esta palavra. Duplicar a função para trocá-la abriria duas cópias de
   * uma regra que precisa continuar sendo uma.
   */
  status: "confirmed" | "skipped" = "confirmed",
): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();
  const prescriptionRepository = new PrescriptionRepository();
  const intakeLogRepository = new IntakeLogRepository();
  const registerIntake = new RegisterIntake(intakeLogRepository, new InventoryRepository(), () =>
    Crypto.randomUUID(),
  );

  const agora = new Date().toISOString();

  for (const doseScheduleId of doseScheduleIds) {
    const doseSchedule = await doseScheduleRepository.findById(doseScheduleId);
    if (doseSchedule === null) continue;

    /**
     * **Já respondida não é confirmada de novo.**
     *
     * No Android a notificação não some sozinha ao tocar num botão de ação: ela fica na bandeja, e
     * cada toque dispara esta função outra vez. Sem esta guarda, cinco toques em "Tomei" gravavam
     * cinco ingestões e descontavam cinco doses do estoque — um remédio "consumido" cinco vezes
     * por um dedo insistente. É o defeito mais caro possível num app que existe para manter o
     * estoque fiel.
     *
     * A notificação passou a ser dispensada no primeiro toque (ver `tratarRespostaAoAviso`), mas a
     * guarda fica: quem protege o dado é a regra, não a interface.
     */
    const logs = await intakeLogRepository.findByDoseSchedule(doseScheduleId);
    const ultimo = logs.at(-1);
    if (ultimo !== undefined && resolvesDose(ultimo.status)) continue;

    const prescription = await prescriptionRepository.findById(doseSchedule.prescriptionId);
    if (prescription === null) continue;

    await registerIntake.execute({
      id: Crypto.randomUUID(),
      doseScheduleId,
      medicationId: prescription.medicationId,
      status,
      occurredAt: agora,
      // A dose gravada no agendamento, e não a da prescrição: elas divergem quando a dose varia
      // por horário, e é a do agendamento que descreve o que se toma **nesta** vez.
      amount: doseSchedule.amount,
    });
  }

  // Avisa a tela de alarme, se ela estiver aberta tocando: sem isto ela só perceberia na próxima
  // revalidação, e o som seguiria por alguns segundos depois de a dose já estar registrada.
  anunciarDosesResolvidas(doseScheduleIds);

  // As doses confirmadas deixam de gerar aviso, e o horário reagendado some da fila.
  await reagendarTodosOsAvisos();
}

/**
 * "Adiar" — empurra o aviso em alguns minutos, **sem registrar desfecho nenhum**.
 *
 * Nada é gravado no histórico: nem `confirmed`, nem `skipped`, nem `deferred`. Isso é deliberado e
 * importa mais quando o horário tem vários remédios. Quem tomou um e não o outro não está afirmando
 * nada sobre nenhum deles ao adiar — está dizendo "me lembra de novo daqui a pouco". Registrar um
 * desfecho ali inventaria uma resposta que ninguém deu, e num app cujo valor é a fidelidade do
 * registro isso é o erro mais caro.
 *
 * O que muda no banco é só `snoozeCount`, que é a trava: **um adiamento por horário**. Marcá-la em
 * todas as doses do aviso é o que faz o segundo toque não existir — o botão some, em vez de
 * aparecer e não funcionar.
 *
 * O aviso que volta é recalculado do zero, então traz só o que ainda estiver pendente: se a
 * Losartana foi confirmada pela Home nesse meio-tempo, ela não reaparece.
 */
export async function adiarAviso(doseScheduleIds: string[]): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();

  /**
   * Só segue se **alguma** dose ainda tinha adiamento a gastar.
   *
   * O `UPDATE` já recusava o segundo adiamento, mas caladamente: o lembrete era agendado de
   * qualquer forma, e cinco toques em "Adiar" produziam cinco lembretes com um `snooze_count` que
   * nunca passou de 1. Agora a trava do banco governa o comportamento — quem não gastou nada não
   * agenda nada.
   */
  let alguemAdiou = false;
  for (const doseScheduleId of doseScheduleIds) {
    const adiou = await doseScheduleRepository
      .incrementSnoozeCount(doseScheduleId)
      .catch(() => false);
    if (adiou) alguemAdiou = true;
  }

  if (!alguemAdiou) return;

  await reagendarTodosOsAvisos();
  await agendarLembreteAdiado(doseScheduleIds);
}

/**
 * O aviso adiado propriamente dito.
 *
 * Fica separado de `reagendarTodosOsAvisos` porque não pertence à janela: aquela função reconstrói
 * o que está **agendado por horário**, e o adiamento é um aviso extra, fora da grade, que existe
 * só até tocar. Colocá-lo na janela faria a próxima reconstrução apagá-lo.
 */
async function agendarLembreteAdiado(doseScheduleIds: string[]): Promise<void> {
  const doseScheduleRepository = new DoseScheduleRepository();
  const prescriptionRepository = new PrescriptionRepository();
  const medicationRepository = new MedicationRepository();

  const linhas: string[] = [];
  /**
   * O horário original das doses — o que a tela de alarme usa para encontrá-las.
   *
   * Todas as doses de um aviso compartilham o instante (é o que as agrupa), então basta o da
   * primeira que existir.
   */
  let instanteDasDoses: string | null = null;
  for (const doseScheduleId of doseScheduleIds) {
    const doseSchedule = await doseScheduleRepository.findById(doseScheduleId);
    if (doseSchedule === null) continue;
    const prescription = await prescriptionRepository.findById(doseSchedule.prescriptionId);
    if (prescription === null) continue;
    const medication = await medicationRepository.findById(prescription.medicationId);
    if (medication === null) continue;
    instanteDasDoses ??= doseSchedule.scheduledFor;
    // Dois pontos, e não travessão: o mesmo formato do aviso da grade (ver `planejarAvisosDeDose`).
    linhas.push(
      `${medication.name}: ${formatarQuantidade(doseSchedule.amount, prescription.doseUnit)}`,
    );
  }

  if (linhas.length === 0 || instanteDasDoses === null) return;

  const quando = new Date(Date.now() + MINUTOS_DE_ADIAMENTO * 60_000);
  await new NotifeeGateway().agendar({
    // `PREFIXO_ADIADO` é o que faz este aviso escapar do `cancelarTudo` da grade: ele não pertence
    // à janela de horários, e sim ao toque em "Adiar" que acabou de acontecer.
    chave: `${PREFIXO_ADIADO}${quando.toISOString()}`,
    quando,
    // "de novo" porque é a segunda vez que este aviso aparece, e dizer isso evita que ele pareça
    // um horário novo que a pessoa esqueceu.
    titulo:
      linhas.length === 1
        ? "Hora do seu remédio, de novo"
        : `Hora dos seus remédios, de novo (${linhas.length})`,
    corpo: linhas.join("\n"),
    doseScheduleIds,
    // Sem isto a tela de alarme procuraria as doses no minuto em que "Adiar" foi tocado, onde não
    // existe nenhuma — e o alarme voltava sem nome, sem dose e sem foto, com o "Tomei" sem efeito.
    instanteDasDoses,
    modo: "alarm",
    // Já foi adiado: o aviso que volta não oferece adiar de novo.
    semAcoesRapidas: true,
  });
}

/** O que o app deve fazer com a resposta a uma notificação. */
export type RespostaAoAviso =
  | { tipo: "abrirHorario"; dados: DadosDoAviso }
  /** Resolvida em segundo plano — o app não precisa navegar para lugar nenhum. */
  | { tipo: "resolvida" };

/**
 * Traduz a resposta do sistema numa ação do app.
 *
 * Os botões resolvem sem abrir o app (`opensAppToForeground: false`); o toque no **corpo** leva à
 * tela do horário, que é onde a resposta parcial cabe.
 *
 * **A notificação é dispensada antes de qualquer escrita.** No Android ela não sai da bandeja ao
 * receber toque num botão de ação, e enquanto estiver lá cada toque repete a resposta inteira —
 * foi assim que cinco toques em "Adiar" viraram cinco lembretes. Tirar do caminho primeiro fecha a
 * janela entre o dedo e o banco; a guarda de idempotência em `confirmarDosesDoAviso` cobre o
 * resto, porque quem protege o dado é a regra, não a interface.
 */
/**
 * Se **todas** as doses do aviso já foram respondidas — confirmadas ou puladas.
 *
 * Existe para o toque num aviso já resolvido não abrir tela nenhuma. O Android não remove a
 * notificação sozinho depois que ela é respondida por outro caminho (o botão dela mesma, a Home,
 * um segundo toque), e o aviso que fica na bandeja convida ao toque tardio — que abria a tela do
 * alarme só para ela se fechar sozinha no quadro seguinte, produzindo o lampejo azul visto em
 * aparelho em 09/09.
 *
 * Lista vazia devolve `false`: um aviso sem dose vinculada não tem o que resolver, e tratá-lo como
 * resolvido faria o toque perder o efeito. É o caso dos avisos de estoque e receita, que aliás nem
 * chegam aqui — o destino deles é decidido antes, em `destinoDaChave`.
 */
export async function todasAsDosesResolvidas(doseScheduleIds: string[]): Promise<boolean> {
  if (doseScheduleIds.length === 0) return false;

  const intakeLogRepository = new IntakeLogRepository();
  for (const doseScheduleId of doseScheduleIds) {
    const logs = await intakeLogRepository.findByDoseSchedule(doseScheduleId);
    const ultimo = logs.at(-1);
    if (ultimo === undefined || !resolvesDose(ultimo.status)) return false;
  }
  return true;
}

export async function tratarRespostaAoAviso(
  actionIdentifier: string,
  dados: DadosDoAviso,
): Promise<RespostaAoAviso> {
  const respondeuPorBotao =
    actionIdentifier === ACAO_TOMEI ||
    actionIdentifier === ACAO_PULEI ||
    actionIdentifier === ACAO_ADIAR;
  if (respondeuPorBotao && dados.chave.length > 0) {
    await new NotifeeGateway().dispensar(dados.chave);
  }

  if (actionIdentifier === ACAO_TOMEI) {
    await confirmarDosesDoAviso(dados.doseScheduleIds);
    return { tipo: "resolvida" };
  }

  // "Pulei" percorre o mesmo caminho, gravando o outro desfecho: registrar que **não** foi tomada
  // é tão informativo quanto o contrário, e é o que separa "pulada" de "sem registro" no relatório.
  if (actionIdentifier === ACAO_PULEI) {
    await confirmarDosesDoAviso(dados.doseScheduleIds, "skipped");
    return { tipo: "resolvida" };
  }

  if (actionIdentifier === ACAO_ADIAR) {
    await adiarAviso(dados.doseScheduleIds);
    return { tipo: "resolvida" };
  }

  return { tipo: "abrirHorario", dados };
}
