import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CardCompromissoProximo.styles";

const MESES_ABREVIADOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

type CardCompromissoProximoProps = {
  quando: Date;
  title: string;
  /** Onde é. Ausente quando o compromisso não tem endereço útil. */
  location: string | null;
  /** Preparo escrito no cadastro: "jejum de 12h", "levar exames antigos". */
  notes: string | null;
  /** Dias inteiros até lá. `0` = hoje. */
  emDias: number;
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
  onPress,
}: CardCompromissoProximoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const ehHoje = emDias === 0;
  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");

  const distancia = ehHoje ? "HOJE" : emDias === 1 ? "AMANHÃ" : `EM ${emDias} DIAS`;
  const linhaDoQuando = `${horas}:${minutos}${location !== null && location.length > 0 ? ` · ${location}` : ""}`;

  /** Lido como uma frase só, na ordem em que se pergunta: quando, o quê, onde, o que preparar. */
  const descricaoFalada = [distancia.toLowerCase(), title, linhaDoQuando, notes]
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

        <Ionicons name="chevron-forward" size={18} color={cores.outline} />
      </View>

      {notes !== null && notes.length > 0 ? (
        <View style={styles.preparo}>
          <Ionicons name="alert-circle-outline" size={18} color={cores.onSurfaceVariant} />
          <Text style={styles.preparoTexto} numberOfLines={2}>
            {notes}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
