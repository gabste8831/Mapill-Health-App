import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { AppointmentOutcome } from "@/domain/entities/appointment";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardCompromissoProximo.styles";

const MESES_ABREVIADOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

const ROTULO_DO_DESFECHO: Record<AppointmentOutcome, string> = {
  attended: "Fui",
  missed: "Não fui",
};

type CardCompromissoProximoProps = {
  quando: Date;
  title: string;
  /** Onde é. Ausente quando o compromisso não tem endereço útil. */
  location: string | null;
  /** Preparo escrito no cadastro: "jejum de 12h", "levar exames antigos". */
  notes: string | null;
  /** Dias inteiros até lá. `0` = hoje. */
  emDias: number;
  /** Compareceu ou não, quando já respondido. `null` = ainda sem resposta. */
  outcome: AppointmentOutcome | null;
  /**
   * O horário já passou? Decide se a pergunta "você foi?" aparece.
   *
   * Vem de fora porque a tela que monta a lista já tem o instante e o relógio — recalcular aqui
   * faria dois lugares lerem a hora e discordarem por um segundo.
   */
  jaAconteceu: boolean;
  /** Grava o desfecho. Ausente quando a tela não quer oferecer a resposta. */
  onResponder?: (outcome: AppointmentOutcome) => void;
  onPress: () => void;
};

/**
 * O compromisso que está chegando, na Home.
 *
 * ## Por que ele não é o card azul
 *
 * O azul cheio da próxima dose é a única quebra da paleta neutra da Home — é o que a faz saltar. Um
 * segundo card azul não somaria destaque, dividiria o que existe, e a dose perderia a vaga que a
 * torna a próxima coisa a fazer. Aqui a presença vem da barra lateral e do bloco de data, que é a
 * assinatura visual do compromisso na listagem: quem já viu a lista reconhece o card antes de ler.
 *
 * ## O que ele mostra que a linha não mostrava
 *
 * O **preparo**. É a única informação do compromisso que exige ação antecipada — jejum, levar
 * exames, chegar mais cedo — e descobri-la só ao abrir o detalhe é descobrir tarde. Um aviso de
 * "jejum de 12h" que aparece cinco dias antes é o que evita a consulta perdida por ter tomado café.
 *
 * No dia, a barra e o bloco de data viram verdes, como o cartão de dose de agora: é o mesmo sinal
 * de "é hoje" que o resto da tela já usa.
 */
export function CardCompromissoProximo({
  quando,
  title,
  location,
  notes,
  emDias,
  outcome,
  jaAconteceu,
  onResponder,
  onPress,
}: CardCompromissoProximoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  /**
   * "Hoje" para a cor, mas **só enquanto não aconteceu**.
   *
   * Verde no app quer dizer "é agora". Depois que a hora passou e a pessoa respondeu, o compromisso
   * não é mais o que está acontecendo — o card volta ao neutro e quem diz o que houve é o selo.
   */
  const ehHoje = emDias === 0 && outcome === null;
  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");

  /**
   * "HOJE" continua sendo verdade mesmo depois da hora — o que muda é a cor, não o fato. Já
   * respondido, o rótulo some: quem responde já sabe que foi hoje, e o selo passa a ser a
   * informação nova daquela linha.
   */
  const distancia =
    emDias === 0 ? "HOJE" : emDias === 1 ? "AMANHÃ" : `EM ${emDias} DIAS`;
  const linhaDoQuando = `${horas}:${minutos}${location !== null && location.length > 0 ? ` · ${location}` : ""}`;

  /** Lido como uma frase só, na ordem em que se pergunta: quando, o quê, onde, o que preparar. */
  const descricaoFalada = [
    distancia.toLowerCase(),
    title,
    linhaDoQuando,
    notes,
    outcome === null ? null : ROTULO_DO_DESFECHO[outcome],
  ]
    .filter((parte): parte is string => parte !== null && parte.length > 0)
    .join(", ");

  return (
    <Pressable
      // Card de largura total: escurece sem encolher, como os outros da Home.
      style={estadoDePressao([styles.container, ehHoje && styles.containerHoje])}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${descricaoFalada}. Toque para ver os detalhes.`}>
      <View style={styles.topo}>
        <View style={[styles.dataColuna, ehHoje && styles.dataColunaHoje]}>
          <Text style={styles.diaDoMes}>{quando.getDate()}</Text>
          <Text style={styles.mesAbreviado}>{MESES_ABREVIADOS[quando.getMonth()]}</Text>
        </View>

        <View style={styles.texto}>
          {/* "Quando" vem antes de "o quê" enquanto a data não chegou: é a pergunta que se faz
              primeiro ao ver um compromisso que ainda não é hoje. */}
          <Text style={[styles.distancia, ehHoje && styles.distanciaHoje]}>{distancia}</Text>
          <Text style={styles.titulo} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.quando} numberOfLines={1}>
            {linhaDoQuando}
          </Text>
        </View>

        {/* O selo toma o lugar do chevron quando há desfecho: os dois vivem no mesmo canto, e o que
            aconteceu é mais informativo que a seta de "abre detalhes" — que o toque no card já
            oferece de qualquer jeito. */}
        {outcome !== null ? (
          <View style={[styles.selo, outcome === "missed" && styles.seloAusente]}>
            <Text style={[styles.seloTexto, outcome === "missed" && styles.seloTextoAusente]}>
              {ROTULO_DO_DESFECHO[outcome]}
            </Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={cores.outline} />
        )}
      </View>

      {notes !== null && notes.length > 0 ? (
        <View style={styles.preparo}>
          <Ionicons name="alert-circle-outline" size={18} color={cores.onSurfaceVariant} />
          <Text style={styles.preparoTexto} numberOfLines={2}>
            {notes}
          </Text>
        </View>
      ) : null}

      {/* A pergunta só depois que o horário passou, e só enquanto não houver resposta. Antes da
          hora, ela convidaria a responder o que ainda não aconteceu.

          Fora do `Pressable`? Não — ele é o card inteiro. Os botões param a propagação por conta
          própria: um `Pressable` filho consome o toque antes de o pai o receber, então tocar em
          "Fui" grava a resposta em vez de abrir o detalhe. */}
      {jaAconteceu && outcome === null && onResponder !== undefined ? (
        <View style={styles.pergunta}>
          <Text style={styles.perguntaTexto}>Você foi?</Text>
          <View style={styles.botoes}>
            {/* "Não fui" à esquerda e "Fui" à direita, como "Pular"/"Confirmar" na linha de dose:
                a resposta esperada no canto onde o polegar chega, na ordem de Cancelar/OK. */}
            <Pressable
              style={estadoDePressao([styles.botao, styles.botaoNaoFui], { escala: true })}
              onPress={() => onResponder("missed")}
              hitSlop={{ top: 4, bottom: 4 }}
              accessibilityRole="button"
              accessibilityLabel={`Marcar que não compareceu: ${title}`}>
              <Ionicons name="close" size={16} color={cores.onSurfaceVariant} />
              <Text style={styles.botaoNaoFuiTexto}>Não fui</Text>
            </Pressable>
            <Pressable
              style={estadoDePressao([styles.botao, styles.botaoFui], { escala: true })}
              onPress={() => onResponder("attended")}
              hitSlop={{ top: 4, bottom: 4 }}
              accessibilityRole="button"
              accessibilityLabel={`Marcar que compareceu: ${title}`}>
              <Ionicons name="checkmark" size={16} color={cores.onPrimary} />
              <Text style={styles.botaoFuiTexto}>Fui</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
