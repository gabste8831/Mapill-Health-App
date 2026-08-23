import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  carregarMedicamento,
  salvarMedicamento,
  type MedicamentoIds,
} from "@/hooks/use-medication-registration";
import {
  FormularioDeMedicamentoScreen,
  type MedicamentoDraft,
} from "@/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen";
import { CenteredLoader, SuccessOverlay } from "@/ui";

type Carregamento =
  | { estado: "carregando" }
  | { estado: "pronto"; draft: MedicamentoDraft; ids: MedicamentoIds }
  | { estado: "ausente" };

export default function EditarMedicamentoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [carregamento, setCarregamento] = useState<Carregamento>({ estado: "carregando" });
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarMedicamento(id)
      .then((carregado) => {
        if (!ativo) return;
        setCarregamento(
          carregado === null
            ? { estado: "ausente" }
            : { estado: "pronto", draft: carregado.draft, ids: carregado.ids },
        );
      })
      .catch(() => {
        if (ativo) setCarregamento({ estado: "ausente" });
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  // Some sozinho depois de avisar: o registro sumiu (excluído noutra tela), e não há o que editar.
  useEffect(() => {
    if (carregamento.estado !== "ausente") return;
    Alert.alert("Medicamento não encontrado", "Ele pode ter sido excluído.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [carregamento.estado, router]);

  // Ausente também cai aqui: o alerta acima já está a caminho, e a tela não tem o que mostrar.
  if (carregamento.estado !== "pronto") return <CenteredLoader />;

  if (salvo) {
    return (
      <SuccessOverlay
        title="Alterações salvas"
        description="Os horários futuros foram regerados com a nova posologia."
        onDone={() => router.back()}
      />
    );
  }

  return (
    <FormularioDeMedicamentoScreen
      initialValue={carregamento.draft}
      onBack={() => router.back()}
      onSubmit={async (draft) => {
        try {
          await salvarMedicamento(draft, carregamento.ids);
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
