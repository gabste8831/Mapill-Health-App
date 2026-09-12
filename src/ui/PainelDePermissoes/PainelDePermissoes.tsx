import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ItemDePermissao } from "@/notifications/permissoes-de-alarme";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./PainelDePermissoes.styles";

type PainelDePermissoesProps = {
  itens: ItemDePermissao[];
  /** Falso quando falta alguma essencial — muda o tom do painel de "melhore" para "não vai tocar". */
  vaiTocar: boolean;
  /** Só aparece quando o diálogo do sistema ainda pode abrir. */
  onPedirTudo?: () => void;
  /**
   * Leva à tela de ajuda de alertas, onde as cinco autorizações estão sempre listadas.
   *
   * O painel mostra **só as essenciais** — as que impedem o alarme de existir. As outras vivem lá,
   * junto da seção do que o app não consegue verificar, e é esse link que abre o caminho.
   */
  onAbrirDetalhes?: () => void;
};

/**
 * O que falta para o alarme tocar, item por item, com o caminho de cada um.
 *
 * ## Por que uma lista, e não um aviso só
 *
 * São quatro autorizações em quatro telas diferentes do Android, e elas falham de formas
 * diferentes: sem notificação nada toca, sem alarme exato toca atrasado, sem Não Perturbe toca
 * mudo, com economia de bateria pode não tocar. Um aviso genérico — "conceda as permissões" —
 * deixaria a pessoa procurando em três lugares sem saber qual resolve o quê.
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
  onPedirTudo,
  onAbrirDetalhes,
}: PainelDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const pendentes = itens.filter((item) => !item.concedida);
  if (pendentes.length === 0) return null;

  /**
   * **Só as essenciais viram linha aqui**, e o resto vira uma frase.
   *
   * O painel ocupava a tela inteira da Home com cinco linhas, cada uma com título, consequência e
   * instrução — relatado pelo Gabriel em 12/09: "o cliente tem cem por cento da tela útil ocupada
   * por essa listagem". Num aviso que mora acima da agenda do dia, isso inverte a prioridade da
   * tela: o que a pessoa abriu o app para ver fica abaixo do que ela talvez vá configurar.
   *
   * A régua é a consequência, e ela já existia no tipo: `essencial` marca o que impede o alarme de
   * **existir**. As outras degradam (toca atrasado, toca mudo) e cabem numa linha de resumo com o
   * caminho para os detalhes.
   */
  const essenciais = pendentes.filter((item) => item.essencial);
  const secundarias = pendentes.filter((item) => !item.essencial);
  const emDestaque = essenciais.length > 0 ? essenciais : pendentes;
  const resumidas = essenciais.length > 0 ? secundarias : [];

  return (
    <View style={[styles.painel, !vaiTocar && styles.painelCritico]}>
      <View style={styles.topo}>
        <Ionicons
          name={vaiTocar ? "notifications-outline" : "warning"}
          size={22}
          color={vaiTocar ? cores.onWarningSurface : cores.error}
        />
        <Text style={[styles.titulo, !vaiTocar && styles.tituloCritico]}>
          {vaiTocar ? "Deixe o alarme mais confiável" : "O alarme não vai tocar"}
        </Text>
      </View>

      <Text style={[styles.explicacao, !vaiTocar && styles.explicacaoCritica]}>
        {vaiTocar
          ? "Estes ajustes do sistema evitam que o aviso atrase ou fique mudo."
          : "Falta uma autorização do Android para o Mapill conseguir avisar você."}
      </Text>

      <View style={styles.lista}>
        {emDestaque.map((item) => (
          <Pressable
            key={item.chave}
            // Linha de largura total que abre uma tela do sistema: escurece sem encolher.
            style={estadoDePressao(styles.item)}
            onPress={() => void item.abrir()}
            accessibilityRole="button"
            accessibilityLabel={`${item.titulo}. ${item.descricao}${item.comoFazer ? ` ${item.comoFazer}` : ""} Toque para abrir as configurações.`}>
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
            <Ionicons name="chevron-forward" size={20} color={cores.onWarningSurface} />
          </Pressable>
        ))}
      </View>

      {/**
       * As secundárias em **uma linha**, com o caminho para os detalhes.
       *
       * Listá-las aqui é o que fazia o painel tomar a tela: cinco blocos de três linhas cada, acima
       * da agenda do dia. Elas continuam existindo, na tela de ajuda de alertas, onde há espaço para
       * dizer o que cada uma faz — e onde ficam junto da seção do que o app não consegue verificar.
       */}
      {resumidas.length > 0 && onAbrirDetalhes !== undefined ? (
        <Pressable
          style={estadoDePressao(styles.linkDeDetalhes)}
          onPress={onAbrirDetalhes}
          accessibilityRole="button"
          accessibilityLabel={`Mais ${resumidas.length} ${resumidas.length === 1 ? "ajuste" : "ajustes"} podem melhorar os avisos. Toque para ver todos.`}>
          <Text style={styles.linkDeDetalhesTexto}>
            {resumidas.length === 1
              ? "Mais 1 ajuste pode melhorar os avisos"
              : `Mais ${resumidas.length} ajustes podem melhorar os avisos`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={cores.onWarningSurface} />
        </Pressable>
      ) : null}

      {/* Só quando o diálogo ainda pode abrir. Depois de negada, este botão não faria nada — e um
          botão que não faz nada é pior que botão nenhum. */}
      {onPedirTudo !== undefined ? (
        <Pressable
          onPress={onPedirTudo}
          accessibilityRole="button"
          style={estadoDePressao(styles.botaoPedir, { escala: true })}>
          <Text style={styles.botaoPedirTexto}>Permitir avisos</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
