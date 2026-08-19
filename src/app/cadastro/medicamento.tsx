import { useRouter } from "expo-router";
import { useState } from "react";

import { EntryChoiceScreen } from "@/components/EntryChoiceScreen/EntryChoiceScreen";
import { PlaceholderScreen } from "@/components/PlaceholderScreen/PlaceholderScreen";

// "Manual" ainda não tem rota própria — o formulário completo é o B2 do plano de
// desenvolvimento. Fica como estado local nesta tela em vez de virar uma 5ª rota fantasma.
export default function MedicamentoScreen() {
  const router = useRouter();
  const [showManualPlaceholder, setShowManualPlaceholder] = useState(false);

  if (showManualPlaceholder) {
    return (
      <PlaceholderScreen
        icon="create-outline"
        title="Cadastro manual"
        description="O formulário completo (nome, posologia, estoque) chega no bloco B2 do plano de desenvolvimento."
      />
    );
  }

  return (
    <EntryChoiceScreen
      title="Como deseja cadastrar?"
      options={[
        { label: "Escanear código de barras", icon: "barcode-outline", onPress: () => router.push("/cadastro/scanner") },
        { label: "Cadastro manual", icon: "create-outline", onPress: () => setShowManualPlaceholder(true) },
      ]}
    />
  );
}
