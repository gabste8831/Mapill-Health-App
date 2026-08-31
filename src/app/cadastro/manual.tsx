import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import type { PrescriptionRequirement } from "@/domain/entities/medication";
import { salvarMedicamento } from "@/hooks/use-medication-registration";
import { FormularioDeMedicamentoScreen } from "@/telas/CadastroDeMedicamento/FormularioDeMedicamentoScreen";
import { SuccessOverlay } from "@/ui";

const REQUISITOS: PrescriptionRequirement[] = ["none", "simple", "retained", "special"];

export default function CadastroManualScreen() {
  const router = useRouter();
  const [salvo, setSalvo] = useState(false);

  /**
   * O que o scanner leu, quando veio de lá. Vazio no cadastro manual comum.
   *
   * Validado antes de usar: parâmetro de rota é string vinda de fora do TypeScript, e um
   * `requisito` corrompido gravaria uma tarja que não existe. O `find` devolve `undefined` para o
   * que não reconheço, e aí o formulário nasce com o padrão de sempre.
   */
  const params = useLocalSearchParams<{
    nome?: string;
    principioAtivo?: string;
    requisito?: string;
  }>();
  const daCmed =
    params.nome === undefined
      ? undefined
      : {
          name: params.nome,
          activeIngredient: params.principioAtivo ?? "",
          prescriptionRequirement:
            REQUISITOS.find((r) => r === params.requisito) ?? ("none" as PrescriptionRequirement),
        };

  // A confirmação cobre o formulário em vez de substituí-lo: desmontar a tela no mesmo quadro em
  // que ela sai faria o formulário piscar vazio por baixo da animação.
  if (salvo) {
    return (
      <SuccessOverlay
        title="Cadastro concluído"
        description="O medicamento já está na sua lista, com os horários agendados."
        onDone={() => {
          // Fecha o fluxo inteiro (não volta pra escolha "como cadastrar" — o cadastro terminou)
          // e leva pra lista, onde o que acabou de ser criado está visível. Voltar pra Home
          // devolveria a pessoa ao ponto de partida sem mostrar o resultado do que ela fez.
          router.dismissAll();
          router.replace("/remedios");
        }}
      />
    );
  }

  return (
    <FormularioDeMedicamentoScreen
      preenchidoDaCmed={daCmed}
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
