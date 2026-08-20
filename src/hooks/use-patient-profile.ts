import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { PatientProfileRepository } from "@/data/repositories/patient-profile-repository";
import type { PatientProfileDraft } from "@/domain/entities/patient-profile";

/** Web nunca persiste no SQLite (ver `useDatabaseReady`) — lá a ficha é sempre vazia. */
const persistsLocally = Platform.OS !== "web";

/** Ficha salva no formato que a tela usa, ou `null` se ainda não existe. */
export async function loadPatientProfileDraft(): Promise<PatientProfileDraft | null> {
  if (!persistsLocally) return null;
  const profile = await new PatientProfileRepository().getCurrent();
  if (!profile) return null;
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
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
    firstName: draft.firstName,
    lastName: draft.lastName,
    dateOfBirth: draft.dateOfBirth,
    biologicalSex: draft.biologicalSex,
    bloodType: draft.bloodType,
    allergies: draft.allergies,
    emergencyContacts: draft.emergencyContacts,
    notes: draft.notes,
    photoUri: existingProfile?.photoUri ?? null,
    photoSyncOptOut: existingProfile?.photoSyncOptOut ?? false,
    updatedAt: new Date().toISOString(),
    syncedAt: null,
    deletedAt: null,
  });
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

  useEffect(() => {
    loadPatientProfileDraft().then((loaded) => {
      setDraft(loaded);
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (updated: PatientProfileDraft) => {
    await savePatientProfileDraft(updated);
    setDraft(updated);
  }, []);

  return { isLoading, draft, save };
}
