import * as Crypto from "expo-crypto";

import { getDatabase } from "@/data/local/database";
import { CHAVE_DO_FUSO_DA_GRADE } from "@/data/local/migrations/019-app-state";
import { DoseScheduleRepository } from "@/data/repositories/dose-schedule-repository";
import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";


/** O mesmo horizonte do reabastecimento — a grade regerada cobre a mesma janela. */
const HORIZONTE_EM_DIAS = 30;

/** Os mesmos metadados que o cadastro grava. Linha nova nunca nasce sincronizada nem excluída. */
function syncFields() {
  return { updatedAt: new Date().toISOString(), syncedAt: null, deletedAt: null };
}

/**
 * O fuso do aparelho agora — `"America/Sao_Paulo"`, `"America/Manaus"`.
 *
 * O nome IANA, e não o deslocamento em horas: São Paulo é −03:00 em junho e já foi −02:00 em
 * janeiro, e trocar de fuso não é a mesma coisa que entrar no horário de verão. Comparar
 * deslocamentos faria a volta do horário de verão parecer uma viagem e regerar a grade sem motivo.
 */
function fusoAtual(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

async function lerFusoGravado(): Promise<string | null> {
  const linha = await getDatabase().getFirstAsync<{ value: string | null }>(
    "SELECT value FROM app_state WHERE key = ?",
    [CHAVE_DO_FUSO_DA_GRADE],
  );
  return linha?.value ?? null;
}

async function gravarFuso(fuso: string): Promise<void> {
  await getDatabase().runAsync(
    "INSERT INTO app_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?",
    [CHAVE_DO_FUSO_DA_GRADE, fuso, fuso],
  );
}

/**
 * Regera as doses futuras quando o aparelho muda de fuso, para que a **hora de parede** se mantenha.
 *
 * ## O defeito que isto corrige
 *
 * Confirmado em aparelho pelo Gabriel em 13/09 (passo A.6): com o fuso trocado para Manaus (−1 h em
 * relação a Rio do Sul), o remédio das **16:00 passou a avisar às 15:00**.
 *
 * A causa está em como a dose é gravada. `generateDoseSchedules` resolve `"16:00"` para um instante
 * usando o fuso do aparelho **no momento da geração**, e guarda esse instante em UTC. O instante
 * está certo para sempre; o que muda é o que ele significa no relógio da parede depois que o fuso
 * muda.
 *
 * ## Por que isto é um defeito, e não um detalhe
 *
 * "Tomo às 8 da manhã" é uma promessa sobre o **relógio da parede**, não sobre um ponto na linha do
 * tempo. Quem toma às 8 em Rio do Sul e viaja para Manaus continua tomando às 8 — não às 7. A
 * posologia acompanha a rotina da pessoa (café, almoço, hora de dormir), e a rotina acompanha o
 * relógio local.
 *
 * E a falha é **silenciosa**: nada avisa que o horário mudou. Ela atinge justamente a viagem, que é
 * quando a rotina já está mais frágil e o app deveria ser o que segura.
 *
 * ## Por que regerar, e não guardar a hora local
 *
 * O modelo rigoroso seria gravar a hora pretendida (`"16:00"`) e derivar o instante no fuso corrente
 * a cada agendamento. É o que o domínio realmente quer dizer, e foi considerado — mas custa uma
 * coluna nova, o backfill das doses existentes e a revisão dos ~35 arquivos que hoje leem
 * `scheduledFor` como verdade única. Decisão do Gabriel em 13/09: o caminho barato primeiro.
 *
 * Aqui o app guarda **em que fuso a grade foi gerada**. Se ao abrir o fuso for outro, as doses
 * futuras são apagadas e regeradas a partir da posologia — que sempre guardou `"16:00"` como texto,
 * e é a fonte real da hora de parede. O resultado observável é o mesmo; a diferença é que a hora
 * local vira algo reconstruído, e não gravado.
 *
 * ## O que deliberadamente não acontece
 *
 * **O passado não é tocado.** `deleteUpcoming` só apaga o que está à frente. Uma dose tomada às
 * 16:00 de ontem foi tomada naquele instante, e reescrever o horário dela seria falsificar o
 * histórico que o registro de ingestão referencia.
 *
 * **Não roda quando o fuso não mudou** — que é quase sempre. O custo normal desta função é uma
 * leitura de uma linha.
 */
export async function regerarGradeSeOFusoMudou(agora: Date): Promise<boolean> {
  const fuso = fusoAtual();
  const gravado = await lerFusoGravado();

  /**
   * Primeira execução (ou banco recém-apagado): só registra o fuso.
   *
   * Sem `gravado` não há com o que comparar, e regerar aqui seria apagar e recriar a grade inteira
   * na primeira abertura depois de atualizar o app — trabalho para chegar exatamente onde já se
   * estava.
   */
  if (gravado === null) {
    await gravarFuso(fuso);
    return false;
  }

  if (gravado === fuso) return false;

  const prescriptionRepository = new PrescriptionRepository();
  const doseScheduleRepository = new DoseScheduleRepository();

  const hoje = agora.toISOString().slice(0, 10);
  const prescriptions = await prescriptionRepository.findActive(hoje);
  const ate = new Date(agora.getTime() + HORIZONTE_EM_DIAS * 24 * 60 * 60_000);

  for (const prescription of prescriptions) {
    // Apaga e regera, em vez de acrescentar: aqui os instantes **existentes** é que estão errados,
    // e completar buracos deixaria de pé justamente as doses que precisam mudar. É o oposto do
    // `reabastecerGradeDeDoses`, que nunca apaga nada.
    await doseScheduleRepository.deleteUpcoming(prescription.id, agora.toISOString());

    for (const doseSchedule of generateDoseSchedules({ prescription, from: agora, until: ate })) {
      await doseScheduleRepository.save({
        id: Crypto.randomUUID(),
        ...doseSchedule,
        ...syncFields(),
      });
    }
  }

  await gravarFuso(fuso);
  return true;
}
