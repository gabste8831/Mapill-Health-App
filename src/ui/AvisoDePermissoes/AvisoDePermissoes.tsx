import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./AvisoDePermissoes.styles";

type AvisoDePermissoesProps = {
  /** O que se perde sem as autorizacoes, na voz da tela que mostra o aviso. */
  oQueNaoFunciona: string;
  /** Esconde a linha da consequencia para quem ja a diz logo acima, como a Home. */
  semDescricao?: boolean;
  /**
   * `true` quando o app comprova que falta alguma autorizacao, e o bloco fica vermelho.
   *
   * Volta ao azul quando as verificaveis estao atendidas: as outras o app nao consegue ler, e
   * pintar de vermelho o que ele nao sabe seria afirmar um estado inexistente.
   */
  urgente?: boolean;
  onAbrir: () => void;
};

/**
 * Aviso curto de que as autorizacoes do aparelho precisam ser conferidas.
 *
 * Separado do `PainelDePermissoes`, que enumera o que falta e so aparece quando o app consegue
 * verificar. Este cobre as tres autorizacoes que nenhuma API expoe, sobre as quais ele nao pode
 * afirmar nem que faltam nem que estao atendidas.
 *
 * Aparece em toda tela que configura algo dependente delas, e nao so na Home: o momento em que
 * alguem liga um lembrete e o momento em que acredita que sera avisado.
 *
 * Nunca desaparece, porque nao ha o que esperar. Por isso e discreto: um aviso permanente com peso
 * de erro ensina a ignorar todos os outros.
 */
export function AvisoDePermissoes({
  oQueNaoFunciona,
  semDescricao = false,
  urgente = false,
  onAbrir,
}: AvisoDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      style={estadoDePressao([styles.aviso, urgente && styles.avisoUrgente], {
        superficie: true,
      })}
      onPress={onAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${
        urgente ? "Falta autorizar permissões. " : ""
      }Confira as permissões do aparelho. Sem elas ${oQueNaoFunciona} não funciona. Toque para ver quais são.`}>
      {/* No estado urgente o escudo vira triangulo de alerta: cor sozinha nao distingue nada para
          quem nao a percebe, e o icone e o segundo sinal que a WCAG 1.4.1 pede. */}
      <View style={[styles.selo, urgente && styles.seloUrgente]}>
        <Ionicons
          name={urgente ? "warning" : "shield-checkmark"}
          size={22}
          color={urgente ? cores.error : cores.corDeDestaque}
        />
      </View>
      <View style={styles.texto}>
        <Text style={[styles.titulo, urgente && styles.tituloUrgente]}>
          {urgente ? "Falta autorizar permissões" : "Confira as permissões"}
        </Text>
        {semDescricao ? null : (
          <Text style={[styles.descricao, urgente && styles.descricaoUrgente]}>
            Sem elas {oQueNaoFunciona} não funciona.
          </Text>
        )}
      </View>
      {/* A seta acompanha o fundo, senao sai da paleta do bloco no estado urgente. */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={urgente ? cores.onErrorSurface : cores.onPrimarySurface}
      />
    </Pressable>
  );
}
