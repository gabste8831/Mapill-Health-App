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
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/screens/LoginScreen/LoginScreen';
import { initializeDatabase } from '@/data/local/database';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [databaseReady, setDatabaseReady] = useState(false);
  // TODO: trocar por sessão real do Supabase Auth (persistida via expo-secure-store) quando o
  // login for implementado de verdade — hoje é só um gate de UI, reseta a cada abertura do app.
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setDatabaseReady(true));
  }, []);

  // Splash continua visível (ver AnimatedSplashOverlay) até fonte e migrations estarem prontas —
  // evita FOUC de fonte e telas lendo o SQLite antes das migrations rodarem.
  if (!fontsLoaded || !databaseReady) return null;

  if (!hasEnteredApp) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <LoginScreen
          onAuthenticated={() => setHasEnteredApp(true)}
          onContinueWithoutLogin={() => setHasEnteredApp(true)}
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
