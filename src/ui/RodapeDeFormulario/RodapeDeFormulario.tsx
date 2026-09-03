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
 * O rodapé fixo de um formulário longo — onde mora o botão de salvar.
 *
 * ## O problema que ele resolve
 *
 * O rodapé é irmão do `KeyboardAwareScrollView` dentro do mesmo `SafeAreaView`. Como o
 * `KeyboardAvoidingView` encolhe a área disponível quando o teclado abre, o rodapé **sobe junto** e
 * fica colado na borda do teclado: um botão azul espremido, sem respiro, que lê como defeito.
 *
 * ## Por que esconder, e não empurrar com margem
 *
 * A saída óbvia seria dar margem ao botão para ele flutuar acima do teclado. Não serve aqui por
 * dois motivos:
 *
 * 1. **Ele rouba espaço de quem está digitando.** Num formulário longo, o teclado já ocupa metade
 *    da tela; um rodapé fixo acima dele deixa uma faixa estreita para o campo em uso.
 * 2. **Ele promete o que não deveria.** O botão diz "salvar", e num formulário de cadastro clínico
 *    salvar no meio da digitação de um campo é quase sempre engano — o valor que está sendo
 *    digitado ainda não foi confirmado.
 *
 * Então ele **sai de cena** enquanto o teclado está aberto, e volta assim que fecha. E fechar agora
 * é fácil: tocar em qualquer área vazia dispensa o teclado (ver `KeyboardAwareScrollView`), o que
 * antes não existia — era o que tornava o rodapé colado a única coisa visível ali.
 *
 * ⚠️ **Isto vale para o formulário longo, não para popup curto.** Numa folha de decisão rápida
 * (escolher um horário, ajustar o estoque) o botão precisa continuar à vista com o teclado aberto,
 * porque a decisão é uma só e some junto com a folha. Lá quem cuida disso é o `BottomSheet`, que
 * mede a altura do teclado e sobe o conteúdo inteiro.
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
