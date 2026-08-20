import { useRouter } from "expo-router";

import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";

export default function EscolhaScreen() {
  const router = useRouter();

  return (
    <EscolhaDeCadastroScreen
      headerTitle="Novo cadastro"
      title="O que deseja cadastrar?"
      onBack={() => router.back()}
      options={[
        { label: "Medicação", icon: "medkit-outline", onPress: () => router.push("/cadastro/medicamento") },
        { label: "Compromisso", icon: "calendar-outline", onPress: () => router.push("/cadastro/compromisso") },
      ]}
    />
  );
}
