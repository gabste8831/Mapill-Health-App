import { useRouter } from "expo-router";
import { useState } from "react";

import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";
import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";

// "Manual" ainda não tem rota própria — o formulário completo é o B2. Fica como estado local
// nesta tela em vez de virar uma 5ª rota fantasma.
export default function MedicamentoScreen() {
  const router = useRouter();
  const [showManualPlaceholder, setShowManualPlaceholder] = useState(false);

  if (showManualPlaceholder) {
    return (
      <EmConstrucaoScreen
        icon="create-outline"
        title="Cadastro manual"
        description="O formulário completo (nome, posologia, estoque) ainda não foi implementado."
        onBack={() => setShowManualPlaceholder(false)}
      />
    );
  }

  return (
    <EscolhaDeCadastroScreen
      headerTitle="Nova medicação"
      title="Como deseja cadastrar?"
      onBack={() => router.back()}
      options={[
        { label: "Escanear código de barras", icon: "barcode-outline", onPress: () => router.push("/cadastro/scanner") },
        { label: "Cadastro manual", icon: "create-outline", onPress: () => setShowManualPlaceholder(true) },
      ]}
    />
  );
}
