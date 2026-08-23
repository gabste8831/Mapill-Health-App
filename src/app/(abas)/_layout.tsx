import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { colors } from "@/shared/theme";

/**
 * A ramificação é feita aqui dentro, e não num `_layout.web.tsx`: arquivo de rota vem do
 * `require.context` do expo-router, que não resolve sufixo de plataforma como um import comum
 * (`getRoutes` não trata `.web`). Um `_layout.web.tsx` seria tratado como uma rota chamada
 * "_layout.web" e nunca substituiria esta.
 */
export default function AppTabsLayout() {
  return Platform.OS === "web" ? <AbasWeb /> : <AbasNativas />;
}

// Ícone preenchido só na aba ativa.
function AbasNativas() {
  return (
    <NativeTabs
      /**
       * Um tom acima do branco, e não branco como o `Header`. A barra nativa não aceita borda
       * (a API expõe cor de fundo, indicador e ripple, e `shadowColor` só no iOS), então card ou
       * botão branco encostando nela se fundiam num bloco só. O degrau de cor faz a separação
       * que a borda faria. O azul fica reservado à aba ativa: é o único destaque, então ele
       * aponta.
       */
      backgroundColor={colors.surfaceContainerLow}
      tintColor={colors.primary}
      iconColor={{ default: colors.outline, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.outline },
        selected: { color: colors.primary },
      }}
      // Sem isto o Android pinta a pílula da aba ativa com a cor dinâmica do Material You, que
      // vem do papel de parede do aparelho — no teste ela saiu verde. A cor da marca não pode
      // depender de qual foto a pessoa colocou no celular.
      indicatorColor={colors.secondaryContainer}
      rippleColor={colors.secondaryContainer}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md={{ default: "home", selected: "home_filled" }} />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendario">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Calendário</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="remedios">
        <NativeTabs.Trigger.Icon sf="pills" md="medication" />
        <NativeTabs.Trigger.Label>Remédios</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="ajustes">
        <NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} md="settings" />
        <NativeTabs.Trigger.Label>Ajustes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/**
 * No navegador o `NativeTabs` vira uma lista de abas em texto (Radix) que não se parece com o
 * app. Aqui as mesmas abas são desenhadas em JS como barra inferior, só pro preview ficar
 * legível — o aparelho continua usando a barra nativa.
 */
function AbasWeb() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendário",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="remedios"
        options={{
          title: "Remédios",
          tabBarIcon: ({ color, size }) => <Ionicons name="medkit" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
