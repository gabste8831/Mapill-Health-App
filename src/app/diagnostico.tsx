import { useRouter } from "expo-router";

import { DiagnosticoScreen } from "@/telas/Diagnostico/DiagnosticoScreen";

export default function DiagnosticoRoute() {
  const router = useRouter();

  return (
    <DiagnosticoScreen
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/ajustes"))}
    />
  );
}
