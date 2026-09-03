import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCores } from "@/shared/theme";
import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";

export default function EscolhaScreen() {
  const router = useRouter();
  const cores = useCores();

  return (
    <EscolhaDeCadastroScreen
      headerTitle="Novo cadastro"
      intro="Selecione o tipo de registro que deseja criar para manter seu acompanhamento de saúde organizado."
      onBack={() => router.back()}
      options={[
        {
          label: "Cadastrar uma medicação",
          description: "Adicione remédios, defina horários, gerencie lembretes e controle seu estoque.",
          icon: <MaterialCommunityIcons name="pill" size={26} color={cores.primary} />,
          onPress: () => router.push("/cadastro/medicamento"),
        },
        {
          label: "Cadastrar um compromisso",
          description: "Centralize sua agenda de saúde e evite perder prazos de consultas e exames.",
          icon: <MaterialCommunityIcons name="calendar-month" size={26} color={cores.primary} />,
          onPress: () => router.push("/cadastro/compromisso"),
        },
      ]}
    />
  );
}
