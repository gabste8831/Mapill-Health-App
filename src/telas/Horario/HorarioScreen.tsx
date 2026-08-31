import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDosesDoHorario, type DoseDoHorario } from "@/hooks/use-doses-do-horario";
import { dataEHoraPorExtenso } from "@/shared/datas-por-extenso";
import { colors } from "@/shared/theme";
import { Button, CenteredLoader, EstadoDeErro, Header } from "@/ui";
import { styles } from "./HorarioScreen.styles";

type ItemProps = {
  dose: DoseDoHorario;
  onConfirmar: () => void;
  onPular: () => void;
  /** "Ignorar por agora" — registra que viu, sem dizer se tomou. A dose segue pendente. */
  onAdiar: () => void;
};

function ItemDeDose({ dose, onConfirmar, onPular, onAdiar }: ItemProps) {
  const confirmada = dose.latestStatus === "confirmed";
  const adiada = dose.latestStatus === "deferred";

  return (
    <View style={[styles.card, dose.resolvida && styles.cardResolvido]}>
      <View style={styles.cardTopo}>
        <View style={styles.cardTexto}>
          <Text style={styles.nome}>{dose.medicationName}</Text>
          <Text style={styles.quantidade}>{dose.quantidadeFormatada}</Text>
          {dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
            <Text style={styles.orientacao}>{dose.intakeNote}</Text>
          ) : null}
        </View>

        {/* Resolvida, o selo substitui os botões: o que aconteceu já é a resposta, e reoferecer as
            duas ações faria parecer que nada foi registrado. */}
        {dose.resolvida ? (
          <View style={styles.selo}>
            <Ionicons
              name={confirmada ? "checkmark-circle" : "close-circle"}
              size={22}
              color={confirmada ? colors.success : colors.onSurfaceVariant}
            />
            <Text style={styles.seloTexto}>{confirmada ? "Tomada" : "Pulada"}</Text>
          </View>
        ) : null}
      </View>

      {dose.resolvida ? (
        // Corrigir continua possível — é o que torna aceitável confirmar direto pela notificação,
        // sem passar por uma tela. Nada aqui é irreversível.
        <Text style={styles.corrigirDica}>
          Registrou errado? Toque em {confirmada ? "“Pulei”" : "“Tomei”"} para corrigir.
        </Text>
      ) : null}

      {/* Adiada não é resolvida: ela continua pendente e volta a aparecer. O que muda é a tela
          dizer que a pessoa **viu** — sem isso, "vi e resolvo depois" seria indistinguível de
          "nunca abri o app", e a dose voltaria como se ninguém tivesse notado nada. */}
      {adiada ? (
        <Text style={styles.adiadaDica}>
          Você marcou para resolver depois. A dose continua pendente.
        </Text>
      ) : null}

      {/* O botão escolhido fica azul cheio; o outro, contornado. Enquanto nada foi respondido os
          dois são contornados — nenhuma das duas respostas pode parecer a sugerida, porque o
          registro só vale se for o que de fato aconteceu. */}
      {/* `emFolha` porque o cartão da dose é branco como o botão: sem o contorno, o `outline` some
          no fundo e sobra um texto solto — o mesmo motivo pelo qual a prop existe para o
          `BottomSheet`. */}
      <View style={styles.acoes}>
        <Button
          label="Tomei"
          onPress={onConfirmar}
          variant={confirmada ? "primary" : "outline"}
          emFolha
          style={styles.acao}
        />
        <Button
          label="Pulei"
          onPress={onPular}
          variant={dose.latestStatus === "skipped" ? "primary" : "outline"}
          emFolha
          style={styles.acao}
        />
      </View>

      {/**
        * "Ignorar por agora" é a terceira resposta, e a única que **não** encerra a dose.
        *
        * Existe porque as duas de cima obrigam a mentir quem ainda não sabe: quem está no ônibus
        * com o remédio em casa não tomou (então "Tomei" é falso) e não decidiu pular (então
        * "Pulei" também é). Sem esta saída, essa pessoa fecha o app sem responder — e o app perde
        * a informação de que ela **viu**, que é diferente de nunca ter aberto.
        *
        * Fica embaixo e em `text`, com metade do peso visual das outras: é saída legítima, não
        * atalho a ser incentivado. Some quando a dose já foi resolvida ou já está adiada — nos
        * dois casos não há o que adiar.
        */}
      {!dose.resolvida && !adiada ? (
        <Button
          label="Ignorar por agora"
          variant="text"
          onPress={onAdiar}
          style={styles.acaoSecundaria}
        />
      ) : null}
    </View>
  );
}

/**
 * As doses de um horário — o destino do toque na notificação.
 *
 * Existe porque o aviso é **por horário** e não por dose: com dois remédios às 08:00, o botão
 * "Tomei todas" da notificação resolve o caso comum, mas quem tomou um e não o outro não tem como
 * dizer isso num botão. Esta tela é onde a resposta parcial cabe — uma linha por remédio, com
 * Tomei e Pulei em cada.
 *
 * Ela também abre pela agenda, sem notificação nenhuma, e aí é a mesma tela: quem chegou por um
 * caminho reconhece o outro.
 */
export function HorarioScreen() {
  const router = useRouter();
  const { instante } = useLocalSearchParams<{ instante: string }>();
  const { doses, isLoading, error, reload, registrar } = useDosesDoHorario(instante ?? "");

  const pendentes = doses.filter((dose) => !dose.resolvida).length;

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  if (isLoading) return <CenteredLoader />;

  if (error !== null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title="Hora do remédio" onBack={voltar} />
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Hora do remédio" onBack={voltar} />

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {instante !== undefined && instante.length > 0 ? (
          <Text style={styles.quando}>{dataEHoraPorExtenso(new Date(instante))}</Text>
        ) : null}

        {doses.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Nada para tomar neste horário</Text>
            <Text style={styles.vazioTexto}>
              O tratamento pode ter mudado depois que o aviso foi agendado.
            </Text>
          </View>
        ) : (
          <>
            {/* A contagem responde "acabou?" sem obrigar a percorrer a lista de novo — que é a
                pergunta de quem abriu a tela para resolver as doses. */}
            <Text style={styles.resumo}>
              {pendentes === 0
                ? "Tudo respondido por aqui."
                : pendentes === 1
                  ? "1 dose esperando resposta."
                  : `${pendentes} doses esperando resposta.`}
            </Text>

            {doses.map((dose) => (
              <ItemDeDose
                key={dose.doseScheduleId}
                dose={dose}
                onConfirmar={() => void registrar(dose, "confirmed")}
                onPular={() => void registrar(dose, "skipped")}
                onAdiar={() => void registrar(dose, "deferred")}
              />
            ))}

            {/* Saída explícita para a Home, além da seta do topo. Quem chegou pela notificação
                entrou direto nesta tela, sem passar pelo app: a seta leva "para trás" numa pilha
                que pode não ter nada atrás. E depois de responder as doses deste horário, o passo
                seguinte natural é ver o dia inteiro. */}
            <Button
              label={pendentes === 0 ? "Ver meu dia" : "Ir para a Home"}
              variant="outline"
              onPress={() => router.replace("/")}
              style={styles.irParaHome}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
