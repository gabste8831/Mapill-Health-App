import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
// Os mesmos estilos do card de estoque: são a mesma anatomia (ícone redondo, título, seta) e a
// mesma função — um atalho para outra tela. Duas cópias do arquivo só criariam a chance de elas
// divergirem sem motivo.
import { criarEstilos } from "@/ui/CardDeAtalho/CardDeAtalho.styles";

type CardCompromissosProps = {
  onPress: () => void;
};

/**
 * Porta de entrada para a lista de compromissos, na Home.
 *
 * A Home mostra as consultas que já entraram na janela do lembrete, e só elas — uma consulta
 * marcada para daqui a três meses não pode ocupar a tela do dia. Mas ela **existe**, e sem este card
 * não haveria nada na Home dizendo isso: quem marcou algo distante ficava sem confirmação de que o
 * app guardou, a não ser procurando na aba certa.
 *
 * Some quando não há compromisso à frente, como o card de estoque: um convite para uma tela que só
 * tem histórico promete mais do que entrega.
 */
export function CardCompromissos({ onPress }: CardCompromissosProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      style={estadoDePressao(styles.container)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ver meus compromissos agendados">
      <View style={styles.icone}>
        <Ionicons name="calendar" size={22} color={cores.primary} />
      </View>

      {/* Só o título, como no card de estoque: o rótulo da seção já diz o assunto, e a contagem que
          o subtítulo trazia não muda o destino do toque. */}
      <Text style={styles.titulo}>Ver compromissos</Text>

      <Ionicons name="chevron-forward" size={18} color={cores.corDeDestaque} />
    </Pressable>
  );
}
