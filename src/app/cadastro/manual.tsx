import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { saveMedicationRegistration } from "@/hooks/use-medication-registration";
import { CadastroDeMedicamentoScreen } from "@/telas/CadastroDeMedicamento/CadastroDeMedicamentoScreen";

export default function CadastroManualScreen() {
  const router = useRouter();

  return (
    <CadastroDeMedicamentoScreen
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await saveMedicationRegistration(draft);
          // Volta pro início do fluxo, não pra escolha "como cadastrar" — o cadastro terminou.
          router.dismissAll();
        } catch (error) {
          Alert.alert(
            "Não foi possível salvar",
            error instanceof Error ? error.message : "Tente novamente em instantes.",
          );
        }
      }}
    />
  );
}
