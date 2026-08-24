import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import {
  FormularioDeCompromissoScreen,
  type CompromissoDraft,
} from "@/telas/CadastroDeCompromisso/FormularioDeCompromissoScreen";
import { CenteredLoader, SuccessOverlay } from "@/ui";

type Carregamento =
  | { estado: "carregando" }
  | { estado: "pronto"; draft: CompromissoDraft }
  | { estado: "ausente" };

export default function EditarCompromissoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carregarCompromisso, salvarCompromisso } = useAppointmentRegistration();
  const [carregamento, setCarregamento] = useState<Carregamento>({ estado: "carregando" });
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarCompromisso(id)
      .then((draft) => {
        if (!ativo) return;
        setCarregamento(draft === null ? { estado: "ausente" } : { estado: "pronto", draft });
      })
      .catch(() => {
        if (ativo) setCarregamento({ estado: "ausente" });
      });
    return () => {
      ativo = false;
    };
  }, [id, carregarCompromisso]);

  // Some sozinho depois de avisar: o registro sumiu (excluído noutra tela), e não há o que editar.
  useEffect(() => {
    if (carregamento.estado !== "ausente") return;
    Alert.alert("Compromisso não encontrado", "Ele pode ter sido excluído.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [carregamento.estado, router]);

  // Ausente também cai aqui: o alerta acima já está a caminho, e a tela não tem o que mostrar.
  if (carregamento.estado !== "pronto") return <CenteredLoader />;

  if (salvo) {
    return (
      <SuccessOverlay
        title="Alterações salvas"
        description="Seu compromisso foi atualizado na agenda."
        onDone={() => router.back()}
      />
    );
  }

  return (
    <FormularioDeCompromissoScreen
      initialValue={carregamento.draft}
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await salvarCompromisso(draft, id);
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
