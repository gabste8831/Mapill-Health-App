import { useRouter } from "expo-router";

import { EscolhaDeCadastroScreen } from "@/telas/EscolhaDeCadastro/EscolhaDeCadastroScreen";

export default function EscolhaScreen() {
  const router = useRouter();

  return (
    <EscolhaDeCadastroScreen
      title="O que deseja cadastrar?"
      options={[
        { label: "Medicação", icon: "medkit-outline", onPress: () => router.push("/cadastro/medicamento") },
        { label: "Compromisso", icon: "calendar-outline", onPress: () => router.push("/cadastro/compromisso") },
      ]}
    />
  );
}
