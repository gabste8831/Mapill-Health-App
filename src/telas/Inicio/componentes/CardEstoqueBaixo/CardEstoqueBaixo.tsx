import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { diaEMesDoIso } from "@/shared/datas-por-extenso";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardEstoqueBaixo.styles";

type CardEstoqueBaixoProps = {
  medicationName: string;
  daysRemaining: number;
  /** O dia da última dose que o estoque cobre, ISO. `null` quando ele já acabou. */
  lastDay: string | null;
  onAbrirEstoque: () => void;
};

/**
 * A previsão em uma frase: quanto tempo dura, **e até quando**.
 *
 * A data vem junto dos dias porque é ela que responde a pergunta real — "dá para esperar a próxima
 * ida à farmácia?". Com "8 dias" a pessoa tem de abrir o calendário e contar; com "até 19 de set"
 * ela já sabe. A tela de estoque sempre disse as duas coisas, e aqui faltava.
 *
 * Zero não ganha data: não há dia futuro a prometer quando o remédio já acabou.
 */
function resumirPrevisao(daysRemaining: number, lastDay: string | null): string {
  if (daysRemaining <= 0) return "Acabou";
  const ate = lastDay === null ? "" : ` · até ${diaEMesDoIso(lastDay)}`;
  if (daysRemaining === 1) return `Acaba amanhã${ate}`;
  return `Dura ${daysRemaining} dias${ate}`;
}

/**
 * Alerta de estoque baixo — só aparece se o paciente ativou o lembrete pro medicamento
 * (`InventoryItem.lowStockAlertEnabled`), e nunca bloqueia a tela.
 */
export function CardEstoqueBaixo({
  medicationName,
  daysRemaining,
  lastDay,
  onAbrirEstoque,
}: CardEstoqueBaixoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const previsao = resumirPrevisao(daysRemaining, lastDay);

  return (
    <View style={styles.container}>
      {/* A marca-d'água vem primeiro para ficar **atrás**: em React Native a ordem no JSX é a ordem
          de pintura, e um `zIndex` aqui resolveria o mesmo com mais uma regra para manter.

          Escondida do leitor de tela: ela repete em escala o ícone do rótulo logo abaixo, e
          anunciá-la seria dizer "alerta" duas vezes na mesma parada. */}
      <Ionicons
        name="warning"
        size={140}
        color={cores.onErrorPreenchido}
        style={styles.marcaDagua}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <View style={styles.conteudo}>
        <View style={styles.header}>
          <View style={styles.seloDoRotulo}>
            <Ionicons name="warning" size={13} color={cores.onErrorPreenchido} />
          </View>
          <Text style={styles.label}>Alerta de estoque</Text>
        </View>
        {/* Agrupado para o alerta ser lido como uma frase — "Losartana, 3 dias restantes" — em vez
            de dois nós soltos que só fazem sentido juntos. */}
        <View accessible accessibilityLabel={`${medicationName}. ${previsao}`}>
          <Text style={styles.medicationName}>{medicationName}</Text>
          <Text style={styles.daysRemaining}>{previsao}</Text>
        </View>

        {/* Só o caminho que resolve o aviso. O "ignorar lembrete" que existia aqui não tinha para
            onde ir: nada guardava a dispensa, e o card voltava igual na abertura seguinte. */}
        <Pressable
          style={estadoDePressao(styles.primaryButton, { escala: true })}
          onPress={onAbrirEstoque}
          accessibilityRole="button"
          // O rótulo carrega o medicamento: "Abrir estoque" sozinho, lido longe do card, não diz de
          // quê.
          accessibilityLabel={`Abrir o estoque de ${medicationName}`}>
          <Text style={styles.primaryButtonText}>Abrir estoque</Text>
        </Pressable>
      </View>
    </View>
  );
}
