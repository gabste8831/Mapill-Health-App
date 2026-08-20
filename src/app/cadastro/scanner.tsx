import { useRouter } from "expo-router";

import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";

export default function ScannerScreen() {
  const router = useRouter();

  return (
    <EmConstrucaoScreen
      icon="barcode-outline"
      title="Escanear código"
      description="A leitura do código de barras da caixa ainda está sendo desenvolvida."
      onBack={() => router.back()}
    />
  );
}
