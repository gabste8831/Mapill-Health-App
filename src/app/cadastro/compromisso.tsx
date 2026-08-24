import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import { FormularioDeCompromissoScreen } from "@/telas/CadastroDeCompromisso/FormularioDeCompromissoScreen";
import { SuccessOverlay } from "@/ui";

export default function CompromissoScreen() {
  const router = useRouter();
  const { salvarCompromisso } = useAppointmentRegistration();
  const [salvo, setSalvo] = useState(false);

  // A confirmação cobre o formulário em vez de substituí-lo: desmontar a tela no mesmo quadro em
  // que ela sai faria o formulário piscar vazio por baixo da animação.
  if (salvo) {
    return (
      <SuccessOverlay
        title="Compromisso agendado"
        description="Ele já está na sua agenda, no Calendário."
        onDone={() => {
          // Fecha o fluxo inteiro e leva pro Calendário, onde o que acabou de ser criado está
          // visível — voltar pra Home devolveria a pessoa ao ponto de partida sem mostrar o
          // resultado do que ela fez.
          router.dismissAll();
          router.replace("/calendario");
        }}
      />
    );
  }

  return (
    <FormularioDeCompromissoScreen
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await salvarCompromisso(draft);
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
