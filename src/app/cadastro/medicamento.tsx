import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "@/shared/theme";
import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";

export default function MedicamentoScreen() {
  const router = useRouter();
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
          onPress: () => router.push("/cadastro/manual"),
        },
      ]}
    />
  );
}
