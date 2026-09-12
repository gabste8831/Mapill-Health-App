import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ItemDePermissao } from "@/notifications/permissoes-de-alarme";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./PainelDePermissoes.styles";

type PainelDePermissoesProps = {
  /**
   * As pendentes que o app **consegue verificar**. Quem filtra é quem monta (ver `InicioScreen`).
   *
   * O painel não recebe as três não-verificáveis porque não sabe se elas foram atendidas: com elas
   * na lista, ele nunca desapareceria da Home — nem para quem configurou tudo. Elas vivem na ajuda
   * de alertas, onde a seção "você mesmo precisa conferir" diz isso em vez de fingir saber.
   */
  itens: ItemDePermissao[];
  /** Falso quando falta alguma essencial. Hoje muda só a cor: o texto é o mesmo nos dois casos. */
  vaiTocar: boolean;
  /** Leva à ajuda de alertas, onde as cinco estão listadas e se conferem uma a uma. */
  onAbrirDetalhes?: () => void;
};

/**
 * O que falta para o alarme tocar, item por item, com o caminho de cada um.
 *
 * ## Por que uma lista, e não um aviso só
 *
 * São autorizações em telas diferentes do Android, e elas falham de formas diferentes: sem
 * notificação nada toca, sem alarme exato toca atrasado, sem Não Perturbe toca mudo. Um aviso
 * genérico — "conceda as permissões" — deixaria a pessoa procurando em três lugares sem saber qual
 * resolve o quê.
 *
 * Cada linha diz **a consequência** ("Sem isto o aviso pode atrasar dezenas de minutos"), e não o
 * nome técnico da permissão. É a consequência que faz alguém decidir se vale ir até as
 * configurações.
 *
 * ## Por que cada item abre a tela direto
 *
 * No Android, permissão negada não pode ser pedida de novo — o diálogo simplesmente não abre. Levar
 * à tela exata do sistema é a única coisa que funciona, e é por isso que a linha inteira é
 * tocável em vez de haver um botão genérico de "configurações".
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
        Para que seus lembretes funcionem, você precisa autorizar algumas
        permissões. <Text style={styles.enfase}>Todas são necessárias</Text>,
        faltando uma, o aviso não chega.
      </Text>

      <View style={styles.lista}>
        {pendentes.map((item) => (
          <Pressable
            key={item.chave}
            // Linha de largura total que abre uma tela do sistema: escurece sem encolher.
            style={estadoDePressao(styles.item)}
            onPress={() => void item.abrir()}
            accessibilityRole="button"
            accessibilityLabel={`${item.titulo}. ${item.descricao}${item.comoFazer ? ` ${item.comoFazer}` : ""} Toque para abrir as configurações.`}
          >
            <View style={styles.itemTexto}>
              <View style={[styles.itemTopo, styles.itemTopoComRespiro]}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                {item.essencial ? (
                  <View style={styles.selo}>
                    <Text style={styles.seloTexto}>OBRIGATÓRIO</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.itemDescricao}>{item.descricao}</Text>
              {/* O passo dentro da tela do sistema, para o toque não terminar num lugar onde nada
                  indica o que fazer. Vem depois da consequência: primeiro por que importa, depois
                  o que fazer a respeito. */}
              {item.comoFazer !== undefined ? (
                <Text style={styles.itemComoFazer}>{item.comoFazer}</Text>
              ) : null}
            </View>
            {/* A tinta do painel, e nao a da tela: `onSurfaceVariant` e o cinza que le sobre o
                fundo da tela, e no tema escuro ele e claro — sobre a linha branca dava 2.04:1, e a
                seta, que e o que diz que a linha abre algo, praticamente sumia. */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={cores.onWarningSurface}
            />
          </Pressable>
        ))}
      </View>

      {/**
       * **Um botão só, e ele leva à página de conferência** — não concede nada.
       *
       * Saiu daqui o "Permitir avisos", que abria o diálogo de **uma** permissão das cinco. Decisão
       * do Gabriel em 12/09, e o argumento é direto: um botão com nome de resolver tudo que resolve
       * um quinto engana. As linhas acima já levam cada uma à sua tela, e são elas que resolvem.
       *
       * O texto também mudou de "podem melhorar os avisos" para o que é verdade: sem as
       * autorizações o alarme não funciona, e três delas o app nem consegue verificar. O caminho
       * para conferir precisa estar aqui, porque é aqui que a pessoa descobre que há o que conferir.
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
