import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ItemDePermissao } from "@/notifications/permissoes-de-alarme";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./PainelDePermissoes.styles";

type PainelDePermissoesProps = {
  /**
   * As pendentes que o app **consegue verificar**. Quem filtra é quem monta (ver `InicioScreen`).
   *
   * Elas não são exibidas: servem para decidir se o painel aparece. Com as três não-verificáveis
   * aqui, ele nunca sairia da Home — nem para quem configurou tudo —, e um aviso que nunca sai
   * ensina a ignorar o aviso.
   */
  itens: ItemDePermissao[];
  /** Falso quando falta alguma essencial. Hoje muda só a cor: o texto é o mesmo nos dois casos. */
  vaiTocar: boolean;
  /** Leva à ajuda de alertas, onde as cinco estão listadas e se conferem uma a uma. */
  onAbrirDetalhes?: () => void;
};

/**
 * O aviso, na Home, de que o alarme não vai tocar — e o caminho único para resolver.
 *
 * ## Por que ele não lista as permissões
 *
 * Listava, até 12/09: uma linha por autorização pendente, cada uma abrindo a tela do sistema. O
 * problema é que só as **verificáveis** podiam estar ali, porque as outras três (sobrepor apps,
 * início automático, bateria) não expõem estado a nenhuma API — e uma lista parcial de itens
 * obrigatórios define o escopo errado do que falta fazer.
 *
 * O efeito, apontado pelo Gabriel: quem atendia as duas ou três listadas via o painel desaparecer e
 * concluía que terminara. As três restantes seguiam intocadas, e o alarme seguia mudo, sem nada na
 * tela explicando por quê.
 *
 * Com um caminho único, a pessoa chega a uma tela onde as cinco estão visíveis, separadas entre o
 * que o app confere e o que ela precisa conferir. Nenhuma delas desaparece por engano.
 *
 * ## O que ele decide, então
 *
 * Só se aparece. E aparece enquanto alguma das verificáveis estiver pendente — é o sinal mais
 * confiável que o app tem de que algo está errado com os avisos.
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

      {/**
       * O texto diz **"não funciona"**, e não "pode melhorar".
       *
       * A versão anterior tinha dois tons — "deixe o alarme mais confiável" quando faltava só uma
       * secundária, "não vai tocar" quando faltava uma essencial. O Gabriel corrigiu em 12/09, e a
       * correção é factual: sem as autorizações o aviso **não chega**. Chamar isso de melhoria é o
       * app minimizando a própria falha, e quem lê "pode melhorar" deixa para depois.
       *
       * A ênfase em **todas** existe porque a falha é conjuntiva: basta uma pendente para o alarme
       * não tocar, e o painel não tem como dizer qual delas vai ser o problema.
       */}
      <Text style={[styles.explicacao, !vaiTocar && styles.explicacaoCritica]}>
        Para que seus lembretes funcionem, o seu aparelho precisa autorizar cinco permissões.{" "}
        <Text style={styles.enfase}>Todas são necessárias</Text>, faltando uma, o aviso não chega.
      </Text>

      {/**
       * **O painel não lista mais as permissões** — ele avisa e leva ao lugar onde estão todas.
       *
       * As linhas que ficavam aqui mostravam só as que o app consegue verificar, e isso enganava:
       * quem atendia as duas ou três listadas via o painel desaparecer e concluía que terminara,
       * enquanto as três não-verificáveis (sobrepor apps, início automático, bateria) seguiam
       * intocadas e o alarme seguia mudo. Apontado pelo Gabriel em 12/09.
       *
       * Uma lista parcial de itens obrigatórios é pior que nenhuma: ela define o escopo errado do
       * que falta fazer. Com um caminho único, a pessoa vê as cinco de uma vez, e o que ela não
       * autorizar continua visível lá.
       *
       * É também o que devolve a tela à agenda do dia: era este bloco que ocupava a área útil da
       * Home inteira.
       */}
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
