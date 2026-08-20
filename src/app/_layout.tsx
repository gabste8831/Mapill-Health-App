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
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoginScreen } from '@/components/screens/LoginScreen/LoginScreen';
import { OnboardingConsentScreen } from '@/components/screens/OnboardingConsentScreen/OnboardingConsentScreen';
import { PatientProfileScreen } from '@/components/screens/PatientProfileScreen/PatientProfileScreen';
import { useDatabaseReady } from '@/hooks/use-database-ready';
import { useFirstRunGate } from '@/hooks/use-first-run-gate';

SplashScreen.preventAutoHideAsync();

// Máquina de estados da primeira execução (login → consentimento → ficha → app) vive em
// useFirstRunGate — este arquivo só decide o que renderizar para o step atual (SRP, ver
// architecture.md e docs/PLANO-DE-DESENVOLVIMENTO.md, bloco A1).
export default function RootLayout() {
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
  const isDatabaseReady = useDatabaseReady();
  const gate = useFirstRunGate(isDatabaseReady);

  // Splash continua visível (ver AnimatedSplashOverlay) até fonte e migrations estarem prontas —
  // evita FOUC de fonte e telas lendo o SQLite antes das migrations rodarem.
  if (!fontsLoaded || !isDatabaseReady) return null;

  // Texto de UI e Alert ficam aqui (camada de apresentação) — o hook só devolve o resultado.
  async function handleGoogleSignIn() {
    try {
      const result = await gate.signInWithGoogle();
      if (result === 'not-configured') {
        Alert.alert(
          'Login indisponível',
          'O login com Google ainda não foi configurado neste app. Você pode continuar sem login por enquanto — isso não afeta o uso local do Mapill.',
        );
      }
    } catch (error) {
      Alert.alert('Não foi possível entrar', error instanceof Error ? error.message : 'Tente novamente em instantes.');
    }
  }

  if (gate.step === 'login') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <LoginScreen onAuthenticated={handleGoogleSignIn} onContinueWithoutLogin={gate.continueWithoutLogin} />
      </ThemeProvider>
    );
  }

  if (gate.step === 'consent') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OnboardingConsentScreen onAccept={gate.acceptConsent} onBack={gate.canGoBack ? gate.goBack : undefined} />
      </ThemeProvider>
    );
  }

  if (gate.step === 'profile') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PatientProfileScreen
          onContinue={gate.saveProfile}
          onSkip={gate.skipProfile}
          onBack={gate.canGoBack ? gate.goBack : undefined}
        />
      </ThemeProvider>
    );
  }

  // step === 'app': a partir daqui a navegação é 100% do expo-router (arquivos em src/app) —
  // tabs reais + o grupo "cadastro" como modal por cima delas (bloco A1).
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cadastro" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
