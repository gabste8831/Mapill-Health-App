import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import type { CadastroEssencial, CadastroIds } from "@/hooks/use-medication-registration";
import { completarCadastro, saveCadastroEssencial } from "@/hooks/use-medication-registration";
import { EtapaDetalhesScreen } from "@/telas/CadastroDeMedicamento/EtapaDetalhesScreen";
import { EtapaEssencialScreen } from "@/telas/CadastroDeMedicamento/EtapaEssencialScreen";

/** O que a etapa 2 precisa saber do que já foi salvo pra decidir o que perguntar. */
type CadastroEmAndamento = { ids: CadastroIds; essencial: CadastroEssencial };

export default function CadastroManualScreen() {
  const router = useRouter();
  const [emAndamento, setEmAndamento] = useState<CadastroEmAndamento | null>(null);

  function avisarFalha(error: unknown) {
    Alert.alert(
      "Não foi possível salvar",
      error instanceof Error ? error.message : "Tente novamente em instantes.",
    );
  }

  // Fecha o fluxo inteiro, não volta pra escolha "como cadastrar" — o cadastro terminou.
  const encerrar = () => router.dismissAll();

  if (emAndamento === null) {
    return (
      <EtapaEssencialScreen
        onBack={() => router.back()}
        onSalvar={async (essencial) => {
          try {
            await saveCadastroEssencial(essencial);
            encerrar();
          } catch (error) {
            avisarFalha(error);
          }
        }}
        onContinuar={async (essencial) => {
          try {
            setEmAndamento({ ids: await saveCadastroEssencial(essencial), essencial });
          } catch (error) {
            avisarFalha(error);
          }
        }}
      />
    );
  }

  return (
    <EtapaDetalhesScreen
      medicationName={emAndamento.essencial.name}
      prescriptionRequirement={emAndamento.essencial.prescriptionRequirement}
      scheduleKind={emAndamento.essencial.schedule.kind}
      // Voltar aqui não desfaz o que já foi gravado — só encerra o fluxo.
      onBack={encerrar}
      onConcluir={async (detalhes) => {
        try {
          await completarCadastro(emAndamento.ids, detalhes);
          encerrar();
        } catch (error) {
          avisarFalha(error);
        }
      }}
    />
  );
}
