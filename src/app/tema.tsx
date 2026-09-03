import { useRouter } from "expo-router";

import { TemaScreen } from "@/telas/Tema/TemaScreen";

export default function TemaRoute() {
  const router = useRouter();

  return (
    <TemaScreen onBack={() => (router.canGoBack() ? router.back() : router.replace("/ajustes"))} />
  );
}
