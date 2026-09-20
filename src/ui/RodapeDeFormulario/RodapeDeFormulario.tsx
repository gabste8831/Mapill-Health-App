import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useEstilos } from "@/shared/theme";
import { criarEstilos } from "./RodapeDeFormulario.styles";

export type RodapeDeFormularioProps = {
  children: ReactNode;
};

/**
 * O rodape fixo de um formulario longo, onde mora o botao de salvar.
 *
 * Ele sai de cena enquanto o teclado esta aberto, em vez de flutuar acima dele com margem, por
 * duas razoes: rouba espaco de quem digita num formulario que ja perdeu metade da tela, e salvar
 * no meio da digitacao de um campo e quase sempre engano.
 *
 * Vale para o formulario longo, e nao para popup curto: numa folha de decisao rapida o botao
 * precisa continuar a vista, e quem cuida disso e o `BottomSheet`.
 */
export function RodapeDeFormulario({ children }: RodapeDeFormularioProps) {
  const styles = useEstilos(criarEstilos);

  const tecladoAberto = useKeyboardHeight() > 0;

  if (tecladoAberto) return null;

  return (
    <SafeAreaView style={styles.rodape} edges={["bottom"]}>
      <View style={styles.conteudo}>{children}</View>
    </SafeAreaView>
  );
}
