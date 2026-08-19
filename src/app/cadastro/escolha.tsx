import { useRouter } from "expo-router";

import { EntryChoiceScreen } from "@/components/EntryChoiceScreen/EntryChoiceScreen";

export default function EscolhaScreen() {
  const router = useRouter();

  return (
    <EntryChoiceScreen
      title="O que deseja cadastrar?"
      options={[
        { label: "Medicação", icon: "medkit-outline", onPress: () => router.push("/cadastro/medicamento") },
        { label: "Compromisso", icon: "calendar-outline", onPress: () => router.push("/cadastro/compromisso") },
      ]}
    />
  );
}
