import { Stack } from "expo-router";

// Todo esse grupo sobe como modal por cima das tabs (ver root _layout.tsx, onde "cadastro" é
// registrado com presentation: "modal"). Cada tela aqui é uma etapa do ponto de entrada de
// cadastro documentado em screens-and-flows.md §2.
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
