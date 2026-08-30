import * as Crypto from "expo-crypto";
import { useCallback } from "react";
import { Platform } from "react-native";

import { AppointmentRepository } from "@/data/repositories/appointment-repository";
import type { AppointmentOutcome } from "@/domain/entities/appointment";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import type { CompromissoDraft } from "@/telas/CadastroDeCompromisso/FormularioDeCompromissoScreen";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`). */
const persistsLocally = Platform.OS !== "web";

/**
 * Grava e lê compromissos. É bem menor que o equivalente de medicamento porque não há nada a
 * derivar: um compromisso é um registro só, sem posologia para gerar horários nem estoque para
 * conciliar. Existe como hook, e não chamado direto da tela, para manter a regra do projeto de
 * nenhuma tela tocar em repositório sem passar por aqui.
 */
export function useAppointmentRegistration() {
  const salvarCompromisso = useCallback(async (draft: CompromissoDraft, id?: string) => {
    if (!persistsLocally) return;

    const repository = new AppointmentRepository();
    const now = new Date().toISOString();
    const existente = id === undefined ? null : await repository.findById(id);

    await repository.save({
      id: existente?.id ?? Crypto.randomUUID(),
      title: draft.title,
      scheduledFor: draft.scheduledFor,
      location: draft.location,
      professional: draft.professional,
      notes: draft.notes,
      reminderLeadDays: draft.reminderLeadDays,
      reminderOnDay: draft.reminderOnDay,
      // O desfecho não vem do formulário — ele é respondido na agenda, depois que o compromisso
      // acontece. Sem preservá-lo aqui, corrigir o horário de uma consulta apagaria o registro de
      // que ela aconteceu e o que o médico disse.
      outcome: existente?.outcome ?? null,
      outcomeNotes: existente?.outcomeNotes ?? null,
      updatedAt: now,
      // Editar um registro já sincronizado tem que reabrir a pendência de envio, senão a alteração
      // ficaria só aqui e o servidor seguiria com a versão antiga (D1).
      syncedAt: null,
      deletedAt: null,
    });

    // A data, o horário ou os canais de aviso podem ter mudado — e "editar" um aviso agendado é
    // justamente o caminho que gera órfão. Refaz a janela inteira, que é idempotente.
    await reagendarTodosOsAvisos();
  }, []);

  /** O inverso exato de `salvarCompromisso` — por isso os dois moram no mesmo arquivo. */
  const carregarCompromisso = useCallback(async (id: string): Promise<CompromissoDraft | null> => {
    if (!persistsLocally) return null;

    const appointment = await new AppointmentRepository().findById(id);
    if (appointment === null) return null;

    return {
      title: appointment.title,
      scheduledFor: appointment.scheduledFor,
      location: appointment.location,
      professional: appointment.professional,
      notes: appointment.notes,
      reminderLeadDays: appointment.reminderLeadDays,
      reminderOnDay: appointment.reminderOnDay,
    };
  }, []);

  /**
   * Registra o que aconteceu: compareceu ou não, e o que saiu dali.
   *
   * É atualização do próprio registro, e não um evento novo como o `IntakeLog` da dose. A
   * diferença é o que cada um precisa provar: a ingestão exige auditoria (quando foi confirmada,
   * o que foi corrigido depois, com o registro anterior preservado), porque dela sai a adesão que
   * o TCC mede. Do compromisso o que interessa é o estado final — quem marca "faltei" por engano
   * e corrige quer que fique corrigido, não que fique um rastro de dois desfechos.
   *
   * `outcome: null` desfaz a resposta e devolve o compromisso a "ainda não respondido".
   */
  const registrarDesfecho = useCallback(
    async (id: string, outcome: AppointmentOutcome | null, outcomeNotes: string | null) => {
      if (!persistsLocally) return;

      const repository = new AppointmentRepository();
      const existente = await repository.findById(id);
      if (existente === null) return;

      await repository.save({
        ...existente,
        outcome,
        // Desfazer o desfecho leva a anotação junto: ela descreve o que aconteceu, e sem desfecho
        // não há o que ela descreva.
        outcomeNotes: outcome === null ? null : outcomeNotes,
        updatedAt: new Date().toISOString(),
        syncedAt: null,
      });

      // Respondido não avisa mais, e desfazer a resposta traz o aviso de volta — nos dois sentidos
      // é a mesma reconstrução.
      await reagendarTodosOsAvisos();
    },
    [],
  );

  /**
   * Exclusão lógica, pelo mesmo motivo do medicamento: linha apagada some sem deixar recado e
   * voltaria do servidor na sincronização seguinte (D1). Compromisso passado é histórico clínico —
   * saber que a consulta de março aconteceu importa depois.
   */
  const excluirCompromisso = useCallback(async (id: string) => {
    if (!persistsLocally) return;
    await new AppointmentRepository().softDelete(id);
    // Sem isto, o lembrete de uma consulta cancelada continuaria chegando — o alarme órfão do C3.
    await reagendarTodosOsAvisos();
  }, []);

  return { salvarCompromisso, carregarCompromisso, registrarDesfecho, excluirCompromisso };
}
