import { useRouter } from "expo-router";

import { usePatientProfile } from "@/hooks/use-patient-profile";
import { FichaDeSaudeScreen } from "@/telas/FichaDeSaude/FichaDeSaudeScreen";

export default function FichaRoute() {
  const router = useRouter();
  const { isLoading, draft, save } = usePatientProfile();

  // Montar o formulário antes da ficha carregar criaria os campos vazios: o estado inicial de
  // cada input é lido uma única vez, então o valor salvo nunca apareceria.
  if (isLoading) return null;

  return (
    <FichaDeSaudeScreen
      initialValue={draft ?? undefined}
      submitLabel="Salvar alterações"
      onBack={() => router.back()}
      onContinue={async (updated) => {
        await save(updated);
        router.back();
      }}
    />
  );
}
