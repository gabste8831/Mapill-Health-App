import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { salvarMedicamento } from "@/hooks/use-medication-registration";
import { FormularioDeMedicamentoScreen } from "@/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen";
import { SuccessOverlay } from "@/ui";

export default function CadastroManualScreen() {
  const router = useRouter();
  const [salvo, setSalvo] = useState(false);

  // A confirmação cobre o formulário em vez de substituí-lo: desmontar a tela no mesmo quadro em
  // que ela sai faria o formulário piscar vazio por baixo da animação.
  if (salvo) {
    return (
      <SuccessOverlay
        title="Cadastro concluído"
        description="O medicamento já está na sua lista, com os horários agendados."
        // Fecha o fluxo inteiro, não volta pra escolha "como cadastrar" — o cadastro terminou.
        onDone={() => router.dismissAll()}
      />
    );
  }

  return (
    <FormularioDeMedicamentoScreen
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await salvarMedicamento(draft);
          setSalvo(true);
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
