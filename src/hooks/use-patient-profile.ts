import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { PatientProfileRepository } from "@/data/repositories/patient-profile-repository";
import { sincronizar } from "@/data/remote/sync-service";
import type { PatientProfileDraft } from "@/domain/entities/patient-profile";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`) — lá a ficha é sempre vazia. */
const persistsLocally = Platform.OS !== "web";

/** Ficha salva no formato que a tela usa, ou `null` se ainda não existe. */
export async function loadPatientProfileDraft(): Promise<PatientProfileDraft | null> {
  if (!persistsLocally) return null;
  const profile = await new PatientProfileRepository().getCurrent();
  if (!profile) return null;
  return {
    fullName: profile.fullName,
    photoUri: profile.photoUri,
    dateOfBirth: profile.dateOfBirth,
    biologicalSex: profile.biologicalSex,
    bloodType: profile.bloodType,
    allergies: profile.allergies,
    emergencyContacts: profile.emergencyContacts,
    notes: profile.notes,
  };
}

/**
 * Grava a ficha, criando na primeira vez e atualizando nas seguintes. Conta única por paciente:
 * o `id` existente é reaproveitado, então editar nunca gera um segundo registro.
 *
 * Foto e opt-out de nuvem não vêm do formulário — são preservados do registro anterior pra
 * não serem apagados por uma edição que não os tocou.
 */
export async function savePatientProfileDraft(draft: PatientProfileDraft): Promise<void> {
  if (!persistsLocally) return;
  const repository = new PatientProfileRepository();
  const existingProfile = await repository.getCurrent();
  await repository.save({
    id: existingProfile?.id ?? Crypto.randomUUID(),
    fullName: draft.fullName,
    dateOfBirth: draft.dateOfBirth,
    biologicalSex: draft.biologicalSex,
    bloodType: draft.bloodType,
    allergies: draft.allergies,
    emergencyContacts: draft.emergencyContacts,
    notes: draft.notes,
    photoUri: draft.photoUri,
    // Escolha de privacidade feita fora do formulário — preservada pra não ser desfeita por
    // uma edição que não a tocou.
    photoSyncOptOut: existingProfile?.photoSyncOptOut ?? false,
    updatedAt: new Date().toISOString(),
    syncedAt: null,
    deletedAt: null,
  });

  /**
   * Sobe agora, sem esperar o app sair e voltar.
   *
   * A ficha é o caso em que a espera mais custa: quem a edita costuma ficar no app depois, então o
   * gatilho de "voltou ao primeiro plano" pode demorar horas — e se a pessoa trocar de conta nesse
   * meio-tempo, o `pull` traz a versão antiga e a edição some. Foi o que aconteceu com o Gabriel em
   * 14/09, com o nome que ele tinha acabado de corrigir.
   *
   * Sem `await`: a tela não deve esperar a rede para dizer que salvou — o dado já está no SQLite, e
   * é ele que manda. Falhando aqui, a linha continua pendente e a próxima passada a leva.
   */
  void sincronizar().catch(() => {});
}

export type PatientProfileState = {
  /** A tela de edição não pode montar o formulário antes disso — os campos nasceriam vazios. */
  isLoading: boolean;
  draft: PatientProfileDraft | null;
  save: (draft: PatientProfileDraft) => Promise<void>;
};

export function usePatientProfile(): PatientProfileState {
  const [isLoading, setLoading] = useState(true);
  const [draft, setDraft] = useState<PatientProfileDraft | null>(null);

  /**
   * Relê **a cada foco**, e não uma vez na montagem.
   *
   * Era um `useEffect` com lista vazia, e isso bastava para a ficha, que é empurrada com `push` e
   * monta a cada abertura. Mas Ajustes e a Home são **abas**: elas ficam montadas em segundo
   * plano e não remontam quando se navega até elas — então o efeito não rodava de novo, o `draft`
   * continuava o de antes, e a foto recém-salva simplesmente não existia para elas.
   *
   * O sintoma era a foto da ficha "não aparecer nem depois de salvar" no avatar de Ajustes,
   * enquanto aparecia normalmente ao reabrir a ficha para editar. Parecia defeito de imagem, e
   * eram três cópias independentes do mesmo estado: cada tela com o seu `usePatientProfile`, e
   * nenhuma sabendo que outra salvou.
   *
   * `useFocusEffect` é o que os hooks de lista do projeto já fazem (`use-appointment-list`,
   * `use-calendar-agenda`) pelo mesmo motivo, e a releitura é uma consulta a uma linha só.
   */
  const reload = useCallback(async () => {
    const loaded = await loadPatientProfileDraft();
    setDraft(loaded);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const save = useCallback(async (updated: PatientProfileDraft) => {
    await savePatientProfileDraft(updated);
    setDraft(updated);
  }, []);

  return { isLoading, draft, save };
}
