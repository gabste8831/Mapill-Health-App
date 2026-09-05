import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { AppointmentOutcome } from "@/domain/entities/appointment";
import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./ItemDeCompromisso.styles";

export type ItemDeCompromissoProps = {
  /** `HH:MM` local — a agenda do dia só precisa da hora, o dia é o cabeçalho. */
  time: string;
  title: string;
  /** Onde é. Ausente quando o compromisso não tem endereço útil. */
  location: string | null;
  /** Preenchido depois que o dia passou: compareceu ou não. */
  outcome: AppointmentOutcome | null;
};

/**
 * Um compromisso do dia na agenda da Home.
 *
 * ## Por que ele não se parece com uma dose
 *
 * A dose pede uma resposta agora — confirmar ou pular — e por isso carrega dois botões e muda de
 * cor conforme o relógio. O compromisso é o oposto: não há o que fazer no app na hora da consulta,
 * e responder "você foi?" só faz sentido **depois** que ela aconteceu, o que já existe no
 * Calendário.
 *
 * Então aqui ele é informação: que horas, o quê, e onde. Sem botões e sem cor de urgência — se
 * ficasse igual a uma dose, a agenda passaria a cobrar ação de algo que não a aceita, e o vermelho
 * de "atrasada" ao lado de uma consulta das 14h diria que se perdeu algo que talvez tenha
 * acontecido normalmente.
 *
 * O ícone à esquerda é o que separa os dois tipos de linha de relance, no lugar onde a dose tem a
 * hora — as duas colunas se alinham porque a hora vem logo em seguida nos dois.
 */
export function ItemDeCompromisso({ time, title, location, outcome }: ItemDeCompromissoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  /**
   * Lido como uma frase só, na mesma ordem da linha de dose: o que é, que horas, como está.
   *
   * Sem isto o TalkBack para três vezes na mesma linha e anuncia a hora antes de dizer do que se
   * trata — o contrário do que se quer ouvir ao varrer a agenda.
   */
  const partes = [title, time, location, outcome === null ? null : ROTULO_DO_DESFECHO[outcome]];
  const descricaoFalada = partes.filter((parte) => parte !== null).join(", ");

  return (
    <View style={styles.base} accessible accessibilityLabel={descricaoFalada}>
      <View style={styles.icone}>
        <Ionicons name="calendar-outline" size={20} color={cores.corDeDestaque} />
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.titulo} numberOfLines={1}>
          {title}
        </Text>
        {/* Hora e local numa linha só: são as duas coisas que se checa antes de sair de casa, e
            separá-las em duas linhas faria o compromisso ocupar mais altura que uma dose sem
            carregar mais informação. */}
        <Text style={styles.detalhe} numberOfLines={1}>
          {time}
          {location !== null && location.length > 0 ? ` · ${location}` : ""}
        </Text>
      </View>

      {/* O desfecho, quando já existe. Selo e não texto solto: ele responde uma pergunta diferente
          das outras duas linhas — não é sobre o compromisso, é sobre o que aconteceu com ele. */}
      {outcome !== null ? (
        <View style={[styles.selo, outcome === "missed" && styles.seloAusente]}>
          <Text style={[styles.seloTexto, outcome === "missed" && styles.seloTextoAusente]}>
            {ROTULO_DO_DESFECHO[outcome]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const ROTULO_DO_DESFECHO: Record<AppointmentOutcome, string> = {
  attended: "Fui",
  missed: "Não fui",
};
