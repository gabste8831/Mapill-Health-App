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

import { SplashOverlay } from '@/ui';
import { LoginScreen } from '@/telas/Login/LoginScreen';
import { ConsentimentoScreen } from '@/telas/Consentimento/ConsentimentoScreen';
import { FichaDeSaudeScreen } from '@/telas/FichaDeSaude/FichaDeSaudeScreen';
import { useDatabaseReady } from '@/hooks/use-database-ready';
import { useFirstRunGate } from '@/hooks/use-first-run-gate';

SplashScreen.preventAutoHideAsync();

// A máquina de estados da primeira execução (login → consentimento → ficha → app) vive em
// useFirstRunGate. Aqui só se decide o que renderizar pro step atual.
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

  // Splash continua visível (ver SplashOverlay) até fonte e migrations estarem prontas —
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
        <SplashOverlay />
        <LoginScreen onAuthenticated={handleGoogleSignIn} onContinueWithoutLogin={gate.continueWithoutLogin} />
      </ThemeProvider>
    );
  }

  if (gate.step === 'consent') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ConsentimentoScreen onAccept={gate.acceptConsent} onBack={gate.canGoBack ? gate.goBack : undefined} />
      </ThemeProvider>
    );
  }

  if (gate.step === 'profile') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <FichaDeSaudeScreen
          onContinue={gate.saveProfile}
          onBack={gate.canGoBack ? gate.goBack : undefined}
          footerHint="Você poderá voltar aqui e modificar a ficha quando quiser, pela aba Ajustes."
        />
      </ThemeProvider>
    );
  }

  // step === 'app': daqui pra frente quem manda na navegação é o expo-router.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(abas)" />
        <Stack.Screen name="ficha" />
        <Stack.Screen name="cadastro" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
