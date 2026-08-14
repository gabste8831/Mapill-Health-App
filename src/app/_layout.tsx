import { Comfortaa_400Regular, Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as Crypto from 'expo-crypto';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/screens/LoginScreen/LoginScreen';
import { OnboardingConsentScreen } from '@/components/screens/OnboardingConsentScreen/OnboardingConsentScreen';
import { CURRENT_TERMS_VERSION } from '@/components/screens/OnboardingConsentScreen/legal-content';
import {
  PatientProfileScreen,
  type PatientProfileDraft,
} from '@/components/screens/PatientProfileScreen/PatientProfileScreen';
import { initializeDatabase } from '@/data/local/database';
import { ConsentRepository } from '@/data/repositories/consent-repository';
import { PatientProfileRepository } from '@/data/repositories/patient-profile-repository';

SplashScreen.preventAutoHideAsync();

type FirstRunStep = 'login' | 'consent' | 'profile' | 'app';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    // Comfortaa é só pro wordmark "Mapill" (a fonte da logo) — nunca pro resto da UI.
    Comfortaa_400Regular,
    Comfortaa_700Bold,
  });
  const [databaseReady, setDatabaseReady] = useState(false);
  // TODO: trocar por sessão real do Supabase Auth (persistida via expo-secure-store) quando o
  // login for implementado de verdade — hoje é só um gate de UI, reseta a cada abertura do app.
  const [step, setStep] = useState<FirstRunStep>('login');

  useEffect(() => {
    // expo-sqlite web depende de OPFS/SharedArrayBuffer, que é instável em dev (worker às
    // vezes trava com "Sync operation timeout"). O Mapill não é um app web — pular a
    // inicialização real do banco nessa plataforma e liberar a UI (hoje ainda com dados mock)
    // é melhor do que travar a tela de carregamento. Native (Expo Go/EAS) não é afetado.
    if (Platform.OS === 'web') {
      setDatabaseReady(true);
      return;
    }
    initializeDatabase().then(() => setDatabaseReady(true));
  }, []);

  // Splash continua visível (ver AnimatedSplashOverlay) até fonte e migrations estarem prontas —
  // evita FOUC de fonte e telas lendo o SQLite antes das migrations rodarem.
  if (!fontsLoaded || !databaseReady) return null;

  // Chamado ao sair do login (com ou sem conta) — decide se o consentimento já foi dado antes
  // (versão vigente) ou se precisa passar pela tela de novo. Web nunca persiste (ver
  // useEffect acima), então sempre mostra o consentimento nessa plataforma.
  async function handleLoginContinue() {
    if (Platform.OS === 'web') {
      setStep('consent');
      return;
    }
    const consentRepository = new ConsentRepository();
    const currentConsent = await consentRepository.getCurrent();
    const hasValidConsent = currentConsent?.termsVersion === CURRENT_TERMS_VERSION;
    setStep(hasValidConsent ? 'profile' : 'consent');
  }

  async function handleConsentAccept() {
    if (Platform.OS !== 'web') {
      const consentRepository = new ConsentRepository();
      const now = new Date().toISOString();
      await consentRepository.save({
        id: Crypto.randomUUID(),
        termsVersion: CURRENT_TERMS_VERSION,
        acceptedAt: now,
        updatedAt: now,
        syncedAt: null,
        deletedAt: null,
      });
    }
    setStep('profile');
  }

  async function handleProfileContinue(draft: PatientProfileDraft) {
    // Web pula o SQLite (ver useEffect acima) — nada a persistir nessa plataforma ainda.
    if (Platform.OS !== 'web') {
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
    setStep('app');
  }

  if (step === 'login') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <LoginScreen
          onAuthenticated={handleLoginContinue}
          onContinueWithoutLogin={handleLoginContinue}
        />
      </ThemeProvider>
    );
  }

  if (step === 'consent') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OnboardingConsentScreen onAccept={handleConsentAccept} />
      </ThemeProvider>
    );
  }

  if (step === 'profile') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PatientProfileScreen onContinue={handleProfileContinue} onSkip={() => setStep('app')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
