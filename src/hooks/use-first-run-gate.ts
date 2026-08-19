import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { CURRENT_TERMS_VERSION } from "@/components/screens/OnboardingConsentScreen/legal-content";
import type { PatientProfileDraft } from "@/components/screens/PatientProfileScreen/PatientProfileScreen";
import { SupabaseAuthGateway } from "@/data/remote/supabase-auth-gateway";
import { isSupabaseConfigured } from "@/data/remote/supabase-client";
import { ConsentRepository } from "@/data/repositories/consent-repository";
import { PatientProfileRepository } from "@/data/repositories/patient-profile-repository";

/** Etapas obrigatórias antes do app propriamente dito, na ordem em que acontecem. */
export type FirstRunStep = "login" | "consent" | "profile" | "app";

/**
 * Resultado do login com Google. A decisão do que mostrar ao usuário em cada caso é da
 * camada de apresentação — este hook não conhece `Alert` nem textos de UI (SRP, ver
 * `architecture.md`).
 */
export type GoogleSignInResult = "signed-in" | "not-configured";

export type FirstRunGate = {
  step: FirstRunStep;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  continueWithoutLogin: () => Promise<void>;
  acceptConsent: () => Promise<void>;
  saveProfile: (draft: PatientProfileDraft) => Promise<void>;
  skipProfile: () => void;
};

/** Web nunca persiste no SQLite (ver `useDatabaseReady`), então lá o fluxo é sempre completo. */
const persistsLocally = Platform.OS !== "web";

/**
 * "Ficha completa" = tem nome preenchido. É o único campo que já era obrigatório antes de
 * sexo/tipo sanguíneo/contato de emergência existirem, então serve como marcador estável de
 * "o paciente já passou por essa tela", sem quebrar em bancos criados por versões antigas.
 */
async function hasCompletedProfile(): Promise<boolean> {
  if (!persistsLocally) return false;
  const profileRepository = new PatientProfileRepository();
  const existingProfile = await profileRepository.getCurrent();
  return (existingProfile?.firstName.trim().length ?? 0) > 0;
}

async function hasValidConsent(): Promise<boolean> {
  if (!persistsLocally) return false;
  const consentRepository = new ConsentRepository();
  const currentConsent = await consentRepository.getCurrent();
  // Bump em CURRENT_TERMS_VERSION invalida o consentimento anterior e força reconsentimento —
  // exigência da LGPD quando a finalidade/texto do tratamento muda.
  return currentConsent?.termsVersion === CURRENT_TERMS_VERSION;
}

/**
 * Máquina de estados da primeira execução: login → consentimento LGPD → ficha de saúde → app.
 * Cada etapa é pulada se já tiver sido cumprida numa abertura anterior.
 *
 * Fica isolada num hook (e não dentro do layout) porque é regra de fluxo, não de renderização:
 * o layout só decide qual tela desenhar para o `step` atual.
 *
 * @param isDatabaseReady só consulta o SQLite depois das migrations rodarem.
 */
export function useFirstRunGate(isDatabaseReady: boolean): FirstRunGate {
  const [step, setStep] = useState<FirstRunStep>("login");

  /** Decide o destino depois do login (com ou sem conta), respeitando o que já foi cumprido. */
  const continueAfterLogin = useCallback(async () => {
    if (!(await hasValidConsent())) {
      setStep("consent");
      return;
    }
    setStep((await hasCompletedProfile()) ? "app" : "profile");
  }, []);

  useEffect(() => {
    // A sessão do Supabase persiste sozinha entre aberturas (AsyncStorage, ver
    // supabase-client.ts). Sem isso o usuário logaria de novo toda vez, mesmo autenticado.
    if (!isDatabaseReady || !isSupabaseConfigured) return;
    const authGateway = new SupabaseAuthGateway();
    authGateway.getCurrentUser().then((user) => {
      if (user) continueAfterLogin();
    });
  }, [isDatabaseReady, continueAfterLogin]);

  const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
    // Login é opcional por decisão de produto: sem credenciais configuradas o app segue
    // utilizável, então avisamos em vez de prender o usuário numa tela que nunca responde.
    if (!isSupabaseConfigured) return "not-configured";
    const authGateway = new SupabaseAuthGateway();
    await authGateway.signInWithGoogle();
    await continueAfterLogin();
    return "signed-in";
  }, [continueAfterLogin]);

  const acceptConsent = useCallback(async () => {
    if (persistsLocally) {
      const consentRepository = new ConsentRepository();
      const now = new Date().toISOString();
      // Prova de consentimento persistida e versionada — é o registro que comprova o
      // cumprimento do art. 11 da LGPD (tratamento de dado sensível de saúde).
      await consentRepository.save({
        id: Crypto.randomUUID(),
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedAt: now,
        updatedAt: now,
        syncedAt: null,
        deletedAt: null,
      });
    }
    // Cobre reconsentimento (termos mudaram de versão) de quem já tinha ficha preenchida —
    // não faz sentido pedir a ficha de novo só porque o texto legal mudou.
    setStep((await hasCompletedProfile()) ? "app" : "profile");
  }, []);

  const saveProfile = useCallback(async (draft: PatientProfileDraft) => {
    if (persistsLocally) {
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
    setStep("app");
  }, []);

  const skipProfile = useCallback(() => setStep("app"), []);

  return {
    step,
    signInWithGoogle,
    continueWithoutLogin: continueAfterLogin,
    acceptConsent,
    saveProfile,
    skipProfile,
  };
}
