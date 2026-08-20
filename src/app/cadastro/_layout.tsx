import { Stack } from "expo-router";

// O grupo inteiro sobe como modal por cima das abas — quem define isso é o `_layout.tsx` raiz,
// onde "cadastro" é registrado com `presentation: "modal"`.
// Header nativo desligado: o topo dessas telas é o `Header` do kit, igual ao do resto do app.
export default function CadastroLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
