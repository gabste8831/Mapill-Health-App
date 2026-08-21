import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { salvarMedicamento } from "@/hooks/use-medication-registration";
import { FormularioDeMedicamentoScreen } from "@/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen";

export default function CadastroManualScreen() {
  const router = useRouter();

  return (
    <FormularioDeMedicamentoScreen
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await salvarMedicamento(draft);
          // Fecha o fluxo inteiro, não volta pra escolha "como cadastrar" — o cadastro terminou.
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
