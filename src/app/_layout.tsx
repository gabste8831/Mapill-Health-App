// Precisa ser o primeiro import do app — supabase-js depende de URL/URLSearchParams, que o
// runtime do React Native não implementa nativamente (ver data/remote/supabase-client.ts).
import 'react-native-url-polyfill/auto';

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
import { Alert, Platform, useColorScheme } from 'react-native';

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
import { isSupabaseConfigured } from '@/data/remote/supabase-client';
import { SupabaseAuthGateway } from '@/data/remote/supabase-auth-gateway';
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
  const [step, setStep] = useState<FirstRunStep>('login');

  // "Ficha completa" = tem nome preenchido — é o único campo que já era obrigatório antes de
  // sexo/tipo sanguíneo/contato existirem, então serve como marcador simples de "o paciente já
  // passou por essa tela". Web nunca persiste (ver useEffect abaixo), então nunca considera
  // completa nessa plataforma.
  async function hasCompletedProfile(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const profileRepository = new PatientProfileRepository();
    const existingProfile = await profileRepository.getCurrent();
    return (existingProfile?.firstName.trim().length ?? 0) > 0;
  }

  // Chamado ao sair do login (com ou sem conta) — decide entre consentimento, ficha ou ir
  // direto pro app, checando o que já foi salvo antes (versão do consentimento aceito, ficha já
  // preenchida). Web nunca persiste (ver useEffect abaixo), então sempre mostra o fluxo completo
  // nessa plataforma.
  async function handleLoginContinue() {
    if (Platform.OS === 'web') {
      setStep('consent');
      return;
    }
    const consentRepository = new ConsentRepository();
    const currentConsent = await consentRepository.getCurrent();
    const hasValidConsent = currentConsent?.termsVersion === CURRENT_TERMS_VERSION;
    if (!hasValidConsent) {
      setStep('consent');
      return;
    }
    setStep((await hasCompletedProfile()) ? 'app' : 'profile');
  }

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

  useEffect(() => {
    // Sessão do Supabase persiste sozinha entre aberturas do app (AsyncStorage, ver
    // supabase-client.ts) — sem isso, o usuário logaria de novo toda vez mesmo já autenticado.
    // Só roda depois do banco pronto porque handleLoginContinue consulta o SQLite.
    if (!databaseReady || !isSupabaseConfigured) return;
    const authGateway = new SupabaseAuthGateway();
    authGateway.getCurrentUser().then((user) => {
      if (user) handleLoginContinue();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleLoginContinue é recriada a
    // cada render (não é useCallback) e não deve disparar esse efeito de novo.
  }, [databaseReady]);

  // Splash continua visível (ver AnimatedSplashOverlay) até fonte e migrations estarem prontas —
  // evita FOUC de fonte e telas lendo o SQLite antes das migrations rodarem.
  if (!fontsLoaded || !databaseReady) return null;

  // Google OAuth de verdade via Supabase Auth. Se as credenciais ainda não estiverem no .env
  // (ver .env.example), avisa e não deixa o usuário preso numa tela que nunca vai responder —
  // "continuar sem login" continua funcionando normalmente nesse caso.
  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Login indisponível',
        'O login com Google ainda não foi configurado neste app. Você pode continuar sem login por enquanto — isso não afeta o uso local do Mapill.',
      );
      return;
    }
    try {
      const authGateway = new SupabaseAuthGateway();
      await authGateway.signInWithGoogle();
      await handleLoginContinue();
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof Error ? error.message : 'Tente novamente em instantes.',
      );
    }
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
    // Cobre o caso de reconsentimento (ex: termos mudaram de versão) num paciente que já tinha
    // ficha preenchida antes — não faz sentido pedir a ficha de novo só porque os termos mudaram.
    setStep((await hasCompletedProfile()) ? 'app' : 'profile');
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
          onAuthenticated={handleGoogleSignIn}
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
