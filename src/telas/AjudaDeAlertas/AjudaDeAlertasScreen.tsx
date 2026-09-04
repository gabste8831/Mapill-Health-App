import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estadoDePressao } from "@/shared/theme";
import { Header } from "@/ui";
import { styles } from "./AjudaDeAlertas.styles";

type AjudaDeAlertasScreenProps = {
  onBack: () => void;
  onAbrirTermos: () => void;
};

/**
 * O que o alerta faz na hora da dose — em tela, e não mais dobrado num acordeão dentro do popup.
 *
 * ## Por que saiu de lá
 *
 * A folha "Como quer ser avisado?" é uma pergunta com três respostas. Ela vinha carregando quatro
 * camadas no mesmo nível — a decisão, o painel de permissões, um aviso sobre o aparelho e este
 * texto inteiro —, e quem abria para escolher um modo precisava atravessar tudo para achar a
 * escolha. Explicação empilhada sobre decisão não informa mais: ela adia a decisão.
 *
 * ## O que se ganhou além do espaço
 *
 * Enquanto isto vivia dentro do modal, ler os termos exigia uma máquina de estado inteira no
 * formulário — fechar o popup para navegar (dois modais empilhados travam a tela no Android),
 * lembrar que ele estava aberto, em que ponto a leitura tinha parado, e reabrir tudo no foco
 * seguinte. Como rota irmã dentro do mesmo stack do cadastro, "ler os termos" é um `push` comum e
 * o botão de voltar do Android faz o caminho de volta sozinho.
 *
 * A tela não conhece rota: quem navega é quem a monta (§2.6.1).
 */
export function AjudaDeAlertasScreen({ onBack, onAbrirTermos }: AjudaDeAlertasScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Como funcionam os alertas" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.abertura}>O alerta organiza a rotina. Ele avisa, e quem toma é você.</Text>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>NA HORA DA DOSE</Text>
          <Text style={styles.texto}>
            O alerta mostra o horário, o remédio, a quantidade daquele horário e a orientação de
            como tomar, se você tiver anotado alguma.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>CONFIRMAR, ADIAR OU IGNORAR</Text>
          <Text style={styles.texto}>
            Você responde dali mesmo, sem abrir o app, e a resposta define o status da dose.
            Confirmou: o estoque desconta, se você estiver controlando. Ignorou: fica registrado que
            a dose não foi tomada. Os dois entram no seu histórico.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>SE VOCÊ ADIAR</Text>
          <Text style={styles.texto}>
            O alerta volta em 5 minutos, uma vez só, para o app não virar despertador infinito. Se
            você não responder nessa segunda vez, a dose fica registrada como não tomada e continua
            na sua lista do dia até você dizer o contrário.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>O QUE O MAPILL NÃO FAZ</Text>
          {[
            "Não confirma dose sozinho. Quem responde é você, sempre.",
            "Não decide sua posologia nem substitui quem receitou. Ele auxilia o tratamento, não conduz.",
            "Não controla as regras do seu celular. Com permissão, volume e bateria em ordem, o Mapill trabalha para manter os alertas íntegros; fora disso, o sistema decide.",
          ].map((limite) => (
            <View key={limite} style={styles.limite}>
              {/* O marcador fica fora do fluxo do texto para a segunda linha alinhar sob a
                  primeira, e não sob a bolinha. */}
              <Text style={styles.limiteMarcador}>•</Text>
              <Text style={styles.limiteTexto}>{limite}</Text>
            </View>
          ))}
        </View>

        {/* O texto que era o aviso "Depende do seu aparelho" dentro do popup. Ali ele competia com
            o painel de permissões, que diz a mesma coisa e ainda leva à tela de cada ajuste; aqui
            ele é o que sempre foi — uma condição explicada, não um alerta. */}
        <View style={styles.condicoes}>
          <Text style={styles.condicoesTitulo}>Depende do seu aparelho</Text>
          <Text style={styles.texto}>
            Com a permissão de avisos ativa e o volume ligado, os alertas chegam na hora marcada.
            Quando falta uma dessas autorizações, o app avisa na tela de escolha do alerta e leva
            você ao ajuste certo.
          </Text>
          {/**
           * A economia de bateria fica aqui, e **não** no painel de permissões.
           *
           * O painel só lista o que o app consegue ler de volta — e o "início automático" dos
           * fabricantes não expõe estado nenhuma API. Cobrado lá, o item nunca sumia, nem depois de
           * autorizado. Como recomendação escrita ele diz a mesma coisa sem prometer uma
           * verificação que não existe.
           */}
          <Text style={[styles.texto, styles.condicoesParagrafo]}>
            Alguns aparelhos — sobretudo Xiaomi, Samsung e Motorola — desligam apps em segundo plano
            para poupar bateria, e isso pode atrasar ou impedir o alarme. Se um aviso não chegar,
            procure o Mapill nas configurações de bateria do seu celular e marque-o como “sem
            restrições”, ou permita o início automático.
          </Text>
        </View>

        <Pressable
          style={estadoDePressao(styles.alvoDeLink, { superficie: true })}
          onPress={onAbrirTermos}
          accessibilityRole="link">
          <Text style={styles.linkParaTermos}>Ler os Termos de Uso completos</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
