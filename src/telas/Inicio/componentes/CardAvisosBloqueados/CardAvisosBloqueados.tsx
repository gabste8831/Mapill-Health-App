import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./CardAvisosBloqueados.styles";

type CardAvisosBloqueadosProps = {
  /** Quantos tratamentos pediram lembrete e não vão receber. É o tamanho do prejuízo. */
  tratamentosAfetados: number;
  onAbrirConfiguracoes: () => void;
};

/**
 * A permissão de notificações está desligada, e existe tratamento que depende dela.
 *
 * **Mora na Home porque o silêncio aqui é o pior defeito possível.** O aviso equivalente já existia
 * no popup de lembrete, mas ele só aparece para quem entra no cadastro — e quem desligou a
 * permissão nas configurações do Android não tem motivo nenhum para voltar lá. Essa pessoa
 * continuaria abrindo o app todo dia, vendo os horários na agenda, e confiando num lembrete que
 * nunca vai chegar. A decisão nº11.5 do projeto é explícita: nunca falhar em silêncio.
 *
 * Some sozinho quando a permissão volta — `useNotificationPermission` reconsulta a cada retorno ao
 * primeiro plano, que é exatamente quando a pessoa volta das configurações do sistema.
 *
 * Amarelo, e não o vermelho do estoque acabando: aqui nada foi perdido ainda, e o que se pede é uma
 * ação de dois toques. Gastar o vermelho onde ele não é emergência é o que faz o vermelho parar de
 * ser lido quando um remédio realmente acaba.
 */
export function CardAvisosBloqueados({
  tratamentosAfetados,
  onAbrirConfiguracoes,
}: CardAvisosBloqueadosProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications-off" size={20} color={colors.onWarningSurface} />
        <Text style={styles.label}>Avisos desligados</Text>
      </View>

      {/* Diz o que deixa de acontecer, e não que "a permissão está desativada": a segunda frase
          descreve uma configuração, a primeira descreve a consequência — que é o que faz alguém
          se mover. */}
      <Text style={styles.texto}>
        {tratamentosAfetados === 1
          ? "O Mapill não vai avisar na hora da dose. Você tem 1 tratamento esperando lembrete."
          : `O Mapill não vai avisar na hora da dose. Você tem ${tratamentosAfetados} tratamentos esperando lembrete.`}
      </Text>

      <Pressable
        style={styles.botao}
        onPress={onAbrirConfiguracoes}
        accessibilityRole="button"
        accessibilityLabel="Abrir as configurações de notificação do Mapill">
        <Text style={styles.botaoTexto}>Religar os avisos</Text>
      </Pressable>
    </View>
  );
}
