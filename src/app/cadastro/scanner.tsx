import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";

export default function ScannerScreen() {
  return (
    <EmConstrucaoScreen
      icon="barcode-outline"
      title="Escanear código"
      description="Leitura de código de barras (EAN) com busca no dicionário CMED chega no bloco B3 do plano de desenvolvimento."
    />
  );
}
