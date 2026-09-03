import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ItemDePermissao } from "@/notifications/permissoes-de-alarme";
import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./PainelDePermissoes.styles";

type PainelDePermissoesProps = {
  itens: ItemDePermissao[];
  /** Falso quando falta alguma essencial — muda o tom do painel de "melhore" para "não vai tocar". */
  vaiTocar: boolean;
  /** Só aparece quando o diálogo do sistema ainda pode abrir. */
  onPedirTudo?: () => void;
};

/**
 * O que falta para o alarme tocar, item por item, com o caminho de cada um.
 *
 * ## Por que uma lista, e não um aviso só
 *
 * São quatro autorizações em quatro telas diferentes do Android, e elas falham de formas
 * diferentes: sem notificação nada toca, sem alarme exato toca atrasado, sem Não Perturbe toca
 * mudo, com economia de bateria pode não tocar. Um aviso genérico — "conceda as permissões" —
 * deixaria a pessoa procurando em quatro lugares sem saber qual resolve o quê.
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
export function PainelDePermissoes({ itens, vaiTocar, onPedirTudo }: PainelDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const pendentes = itens.filter((item) => !item.concedida);
  if (pendentes.length === 0) return null;

  return (
    <View style={[styles.painel, !vaiTocar && styles.painelCritico]}>
      <View style={styles.topo}>
        <Ionicons
          name={vaiTocar ? "notifications-outline" : "warning"}
          size={22}
          color={vaiTocar ? cores.onWarningSurface : cores.error}
        />
        <Text style={styles.titulo}>
          {vaiTocar ? "Deixe o alarme mais confiável" : "O alarme não vai tocar"}
        </Text>
      </View>

      <Text style={styles.explicacao}>
        {vaiTocar
          ? "Estes ajustes do sistema evitam que o aviso atrase ou fique mudo."
          : "Falta uma autorização do Android para o Mapill conseguir avisar você."}
      </Text>

      <View style={styles.lista}>
        {pendentes.map((item) => (
          <Pressable
            key={item.chave}
            style={styles.item}
            onPress={() => void item.abrir()}
            accessibilityRole="button"
            accessibilityLabel={`${item.titulo}. ${item.descricao} Toque para abrir as configurações.`}>
            <View style={styles.itemTexto}>
              <View style={styles.itemTopo}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                {item.essencial ? (
                  <View style={styles.selo}>
                    <Text style={styles.seloTexto}>OBRIGATÓRIO</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.itemDescricao}>{item.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={cores.onSurfaceVariant} />
          </Pressable>
        ))}
      </View>

      {/* Só quando o diálogo ainda pode abrir. Depois de negada, este botão não faria nada — e um
          botão que não faz nada é pior que botão nenhum. */}
      {onPedirTudo !== undefined ? (
        <Pressable onPress={onPedirTudo} accessibilityRole="button" style={styles.botaoPedir}>
          <Text style={styles.botaoPedirTexto}>Permitir avisos</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
