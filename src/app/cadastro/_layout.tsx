import { Stack } from "expo-router";

// O grupo inteiro sobe como modal por cima das abas — quem define isso é o `_layout.tsx` raiz,
// onde "cadastro" é registrado com `presentation: "modal"`.
export default function CadastroLayout() {
  return (
    <Stack>
      <Stack.Screen name="escolha" options={{ title: "Cadastrar" }} />
      <Stack.Screen name="medicamento" options={{ title: "Cadastrar medicação" }} />
      <Stack.Screen name="scanner" options={{ title: "Escanear código" }} />
      <Stack.Screen name="compromisso" options={{ title: "Cadastrar compromisso" }} />
    </Stack>
  );
}
