import { useRouter } from "expo-router";

import { CompromissosScreen } from "@/telas/Compromissos/CompromissosScreen";

export default function CompromissosRoute() {
  const router = useRouter();

  return (
    <CompromissosScreen
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/calendario"))}
    />
  );
}
