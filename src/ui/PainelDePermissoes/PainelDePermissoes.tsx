import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ItemDePermissao } from "@/notifications/permissoes-de-alarme";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./PainelDePermissoes.styles";

type PainelDePermissoesProps = {
  /**
   * As pendentes que o app consegue verificar. Quem filtra e quem monta.
   *
   * Nao sao exibidas: servem para decidir se o painel aparece. Com as nao-verificaveis aqui, ele
   * nunca sairia da Home, nem para quem configurou tudo.
   */
  itens: ItemDePermissao[];
  /** Falso quando falta alguma essencial. Muda so a cor. */
  vaiTocar: boolean;
  onAbrirDetalhes?: () => void;
};

/**
 * O aviso, na Home, de que o alarme nao vai tocar, com um caminho unico para resolver.
 *
 * Nao lista as permissoes porque so as verificaveis poderiam estar ali, e uma lista parcial de
 * itens obrigatorios define o escopo errado: quem atendia as listadas via o painel sumir e
 * concluia ter terminado, com o alarme seguindo mudo.
 */
export function PainelDePermissoes({
  itens,
  vaiTocar,
  onAbrirDetalhes,
}: PainelDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const pendentes = itens.filter((item) => !item.concedida);
  if (pendentes.length === 0) return null;

  return (
    <View style={[styles.painel, !vaiTocar && styles.painelCritico]}>
      <View style={styles.topo}>
        <Ionicons
          name="warning"
          size={22}
          color={vaiTocar ? cores.onWarningSurface : cores.error}
        />
        <Text style={[styles.titulo, !vaiTocar && styles.tituloCritico]}>
          Seus alarmes não vão funcionar
        </Text>
      </View>

      {/* Diz "nao funciona", e nao "pode melhorar": sem as autorizacoes o aviso nao chega, e quem
          le "pode melhorar" deixa para depois. A enfase em todas e porque a falha e conjuntiva, e
          o painel nao tem como dizer qual delas vai ser o problema. */}
      <Text style={[styles.explicacao, !vaiTocar && styles.explicacaoCritica]}>
        Para que seus lembretes funcionem, o seu aparelho precisa autorizar cinco permissões.{" "}
        <Text style={styles.enfase}>Todas são necessárias</Text>, faltando uma, o aviso não chega.
      </Text>

      {onAbrirDetalhes !== undefined ? (
        <Pressable
          onPress={onAbrirDetalhes}
          accessibilityRole="button"
          accessibilityLabel="Ver todas as permissões necessárias e conferir uma por uma"
          style={estadoDePressao(styles.botaoPedir, { escala: true })}
        >
          <Text style={styles.botaoPedirTexto}>Verificar as permissões</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
