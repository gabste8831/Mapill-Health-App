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

import { isSupabaseConfigured } from '@/data/remote/supabase-client';
import { useDatabaseReady } from '@/hooks/use-database-ready';
import { useDoseNotifications } from '@/hooks/use-dose-notifications';
import { useFirstRunGate } from '@/hooks/use-first-run-gate';
import { ConsentimentoScreen } from '@/telas/Consentimento/ConsentimentoScreen';
import { FichaDeSaudeScreen } from '@/telas/FichaDeSaude/FichaDeSaudeScreen';
import { LoginScreen } from '@/telas/Login/LoginScreen';
import { SplashOverlay } from '@/ui';

SplashScreen.preventAutoHideAsync();

/**
 * Mantém a janela de avisos de dose abastecida e trata o toque na notificação.
 *
 * Componente em vez de chamada direta do hook no layout: o hook precisa rodar **só** no passo
 * `app`, e chamá-lo condicionalmente ali quebraria a regra dos hooks. Não desenha nada.
 */
function AvisosDeDose() {
  useDoseNotifications();
  return null;
}

// A máquina de estados da primeira execução (login → consentimento → ficha → app) vive em
// useFirstRunGate. Aqui só se decide o que renderizar pro step atual.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
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
  //
  // `indeciso` entra na mesma espera: o gate ainda está lendo ficha e consentimento, e desenhar
  // qualquer tela aqui seria adivinhar. Sem isso, a de login aparecia por um quadro e sumia, o
  // que lê como falha do app e não como carregamento.
  //
  // Cada uma das três esperas tem que terminar de um jeito ou de outro: enquanto isto devolve
  // `null` nenhuma tela monta, ninguém chama `SplashScreen.hideAsync()`, e o app fica preso no
  // fundo azul da splash sem saída — era o F7 na reabertura. Por isso a fonte que **falhou** conta
  // como resolvida: seguir com a fonte do sistema é feio, ficar na splash para sempre é quebrado.
  // As outras duas se garantem nos próprios hooks (`useDatabaseReady`, `useFirstRunGate`).
  const fontesResolvidas = fontsLoaded || fontError !== null;
  if (!fontesResolvidas || !isDatabaseReady || gate.step === 'indeciso') return null;

  // Texto de UI e Alert ficam aqui (camada de apresentação) — o hook só devolve o resultado.
  async function handleGoogleSignIn() {
    try {
      const result = await gate.signInWithGoogle();
      if (result === 'not-configured') {
        Alert.alert(
          'Login indisponível',
          'O login com Google ainda não foi configurado neste app. Você pode continuar sem login por enquanto. Isso não afeta o uso local do Mapill.',
        );
      }
    } catch (error) {
      Alert.alert('Não foi possível entrar', error instanceof Error ? error.message : 'Tente novamente em instantes.');
    }
  }

  function conteudoDoPasso() {
    if (gate.step === 'login') {
      return (
        <LoginScreen
          onAuthenticated={handleGoogleSignIn}
          onContinueWithoutLogin={gate.continueWithoutLogin}
          googleDisponivel={isSupabaseConfigured}
        />
      );
    }

    if (gate.step === 'consent') {
      return <ConsentimentoScreen onAccept={gate.acceptConsent} onBack={gate.canGoBack ? gate.goBack : undefined} />;
    }

    if (gate.step === 'profile') {
      return (
        <FichaDeSaudeScreen
          onContinue={gate.saveProfile}
          onBack={gate.canGoBack ? gate.goBack : undefined}
          footerHint="Você poderá voltar aqui e modificar qualquer informação da ficha quando quiser, acessando aba de ajustes."
        />
      );
    }

    // step === 'app': daqui pra frente quem manda na navegação é o expo-router.
    return (
      <>
        {/* Só a partir daqui: antes do passo `app` não há rota para a tela do horário abrir, e o
            onboarding não tem dose nenhuma a agendar. */}
        <AvisosDeDose />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(abas)" />
          <Stack.Screen name="ficha" />
          <Stack.Screen name="termos" />
          <Stack.Screen name="estoque" />
          <Stack.Screen name="conta" />
          <Stack.Screen name="horario/[instante]" />
          <Stack.Screen name="adesao" />
          <Stack.Screen name="cadastro" options={{ presentation: 'modal' }} />
        </Stack>
      </>
    );
  }

  /**
   * O `SplashOverlay` fica **fora do passo**, e não dentro de um ramo só.
   *
   * Ele morava apenas no ramo `login`, e é ele quem chama `SplashScreen.hideAsync()`. Quem já tinha
   * passado pelo onboarding caía direto em `app` — onde o overlay não existia —, ninguém escondia a
   * splash nativa, e o app abria travado no fundo azul. Por ser a primeira abertura que passa por
   * `login`, o problema só aparecia ao **reabrir**, que é exatamente como você o encontrou.
   *
   * Aqui ele cobre os quatro passos: qualquer que seja a tela decidida, a splash sai.
   */
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SplashOverlay />
      {conteudoDoPasso()}
    </ThemeProvider>
  );
}
