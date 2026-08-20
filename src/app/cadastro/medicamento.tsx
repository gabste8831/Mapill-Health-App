import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

import { colors } from "@/shared/theme";
import { EmConstrucaoScreen } from "@/telas/EmConstrucao/EmConstrucaoScreen";
import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";

// "Manual" ainda não tem rota própria — o formulário completo é o B2. Fica como estado local
// nesta tela em vez de virar uma 5ª rota fantasma.
export default function MedicamentoScreen() {
  const router = useRouter();
  const [showManualPlaceholder, setShowManualPlaceholder] = useState(false);

  if (showManualPlaceholder) {
    return (
      <EmConstrucaoScreen
        icon="form-select"
        title="Cadastro manual"
        description="O formulário completo (nome, posologia, estoque) ainda não foi implementado."
        onBack={() => setShowManualPlaceholder(false)}
      />
    );
  }

  return (
    <EscolhaDeCadastroScreen
      headerTitle="Nova medicação"
      intro="Escolha como prefere cadastrar. Pelo código de barras é mais rápido; no manual você preenche cada campo."
      onBack={() => router.back()}
      options={[
        {
          label: "Escanear código de barras",
          description: "Aponte a câmera para a caixa e os dados vêm preenchidos.",
          icon: <MaterialCommunityIcons name="barcode-scan" size={26} color={colors.primary} />,
          onPress: () => router.push("/cadastro/scanner"),
        },
        {
          label: "Cadastro manual",
          description: "Informe nome, dosagem, horários e estoque você mesmo.",
          icon: <MaterialCommunityIcons name="form-select" size={26} color={colors.primary} />,
          onPress: () => setShowManualPlaceholder(true),
        },
      ]}
    />
  );
}
