import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDosesDoHorario, type DoseDoHorario } from "@/hooks/use-doses-do-horario";
import { dataEHoraPorExtenso } from "@/shared/datas-por-extenso";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { Button, CenteredLoader, EstadoDeErro, FotoLocal, Header } from "@/ui";
import { criarEstilos } from "./HorarioScreen.styles";

type ItemProps = {
  dose: DoseDoHorario;
  onConfirmar: () => void;
  onPular: () => void;
  /** "Ignorar por agora" — registra que viu, sem dizer se tomou. A dose segue pendente. */
  onAdiar: () => void;
};

function ItemDeDose({ dose, onConfirmar, onPular, onAdiar }: ItemProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const confirmada = dose.latestStatus === "confirmed";
  const pulada = dose.latestStatus === "skipped";
  const adiada = dose.latestStatus === "deferred";

  return (
    <View style={[styles.card, dose.resolvida && styles.cardResolvido]}>
      {/**
       * O bloco de informação lido como **uma frase só**, na ordem em que a pessoa pensa: que
       * remédio, quanto, como está.
       *
       * Sem isto o TalkBack para em quatro nós soltos e o selo "Tomada"/"Pulada" chega depois de um
       * ícone mudo. É o mesmo tratamento que o `ItemDeDose` da Home já faz — e esta tela é o destino
       * do toque na notificação, então merece pelo menos o mesmo cuidado.
       *
       * O agrupamento fica **aqui**, e não no cartão inteiro: `accessible` no cartão engoliria
       * "Tomei" e "Pulei" num nó só, e o leitor perderia justamente as ações que importam.
       */}
      <View
        style={styles.cardTopo}
        accessible
        accessibilityLabel={[
          dose.medicationName,
          dose.quantidadeFormatada,
          dose.resolvida ? (confirmada ? "dose tomada" : "dose pulada") : "aguardando resposta",
          dose.intakeNote ?? "",
        ]
          .filter((parte) => parte.length > 0)
          .join(", ")}>
        {/* A foto da caixa ao lado do nome, quando existe.

            Miniatura e não a foto larga do alarme: ali ela é o assunto da tela, aqui é uma
            confirmação de que a linha é o remédio certo — e há uma por dose, então cada uma que
            crescesse empurraria as outras para fora. Sem foto, nada ocupa o lugar: o nome usa a
            largura toda em vez de ficar preso a uma coluna vazia. */}
        {dose.photoUri !== null ? (
          <FotoLocal uri={dose.photoUri} style={styles.foto} contentFit="contain" />
        ) : null}

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
              color={confirmada ? cores.successVivo : cores.onSurfaceVariant}
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
      {/* `accessibilityState.selected` porque o preenchimento é a **única** pista de qual resposta
          já está registrada, e "azul cheio vs. contornado" não existe para quem usa leitor de tela:
          os dois botões soariam idênticos antes e depois de responder. É a mesma regra que a lista
          de doses perdidas segue — estado nunca só por cor. */}
      {/* "Pulei" à esquerda e "Tomei" à direita, com ícone ao lado do texto — a mesma ordem e a
          mesma forma da tela de alarme. Quem responde nos dois lugares não deve precisar reaprender
          onde fica o quê.

          A cor muda porque o fundo muda: no alarme o cartão é azul, e ali "Tomei" é o botão
          branco; aqui o fundo é claro, então ele é o azul cheio do app. O que se mantém é a
          hierarquia — um botão cheio, um neutro — e o par de ícones, que é o que se reconhece antes
          de ler. */}
      <View style={styles.acoes}>
        <Pressable
          style={estadoDePressao(
            [styles.botaoPulei, pulada && styles.botaoPuleiMarcado],
            { escala: true },
          )}
          onPress={onPular}
          accessibilityRole="button"
          accessibilityState={{ selected: pulada }}
          accessibilityLabel={
            pulada
              ? `Pulei, registrado para ${dose.medicationName}`
              : `Registrar que não tomou ${dose.medicationName}`
          }>
          <Ionicons
            name="close"
            size={18}
            color={pulada ? cores.onPrimary : cores.onSurfaceVariant}
          />
          <Text style={[styles.textoPulei, pulada && styles.textoMarcado]}>Pulei</Text>
        </Pressable>

        <Pressable
          style={estadoDePressao(
            [styles.botaoTomei, confirmada && styles.botaoTomeiMarcado],
            { escala: true },
          )}
          onPress={onConfirmar}
          accessibilityRole="button"
          accessibilityState={{ selected: confirmada }}
          accessibilityLabel={
            confirmada
              ? `Tomei, registrado para ${dose.medicationName}`
              : `Registrar que tomou ${dose.medicationName}`
          }>
          <Ionicons
            name="checkmark"
            size={18}
            color={confirmada ? cores.onPrimary : cores.primary}
          />
          <Text style={[styles.textoTomei, confirmada && styles.textoMarcado]}>Tomei</Text>
        </Pressable>
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
  const styles = useEstilos(criarEstilos);

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

            {/* A saída, sempre visível.

                Chegou a sair sozinha depois da última resposta, e a ideia foi revertida em 05/09:
                a dose respondida mostra a dica de correção ("Registrou errado? Toque em Pulei"), e
                sair antes de ela ser lida torna a dica inútil. Quem responde por engano precisa do
                tempo de perceber — e é a mesma razão pela qual as duas respostas ficam disponíveis
                depois de registradas, em vez de virarem um selo fixo.

                Quem chegou pela notificação entrou direto nesta tela, sem passar pelo app: a seta
                do topo leva "para trás" numa pilha que pode não ter nada atrás, e este botão é o
                caminho certo. */}
            <Button
              label="Ir para a página inicial"
              onPress={() => router.replace("/")}
              style={styles.irParaHome}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
