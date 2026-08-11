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
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/screens/LoginScreen/LoginScreen';
import { PatientProfileScreen } from '@/components/screens/PatientProfileScreen/PatientProfileScreen';
import { initializeDatabase } from '@/data/local/database';

SplashScreen.preventAutoHideAsync();

// TODO: quando o onboarding (tutorial + consentimento LGPD) for implementado, ele entra entre
// 'login' e 'profile' — ver decisão de onboarding em screens-and-flows.md.
type FirstRunStep = 'login' | 'profile' | 'app';

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

  if (step === 'login') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <LoginScreen
          onAuthenticated={() => setStep('profile')}
          onContinueWithoutLogin={() => setStep('profile')}
        />
      </ThemeProvider>
    );
  }

  if (step === 'profile') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PatientProfileScreen
          // TODO: persistir via PatientProfileRepository (src/data/repositories) quando a tela
          // estiver ligada ao SQLite — hoje só avança o fluxo, não salva nada ainda.
          onContinue={() => setStep('app')}
          onSkip={() => setStep('app')}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
