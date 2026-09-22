import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import {
  estadoDePressao,
  PAR_PADRAO,
  PARES_DE_ESTADO,
  useCores,
  useEstilos,
  useTema,
} from "@/shared/theme";
import { criarEstilos } from "./SeletorDeCoresDeEstado.styles";

/**
 * Os três estados que o par pinta, na ordem em que aparecem na amostra.
 *
 * São **as mesmas palavras do parágrafo acima** ("verde para confirmações, amarelo para o que pede
 * atenção, vermelho para o que é urgente"). Um sinônimo aqui obrigaria a pessoa a ligar dois
 * vocabulários para a mesma coisa, no exato momento em que ela está tentando comparar cores.
 */
const ESTADOS = [
  { chave: "afirmativo", rotulo: "Confirmação" },
  { chave: "atencao", rotulo: "Atenção" },
  { chave: "negativo", rotulo: "Urgência" },
] as const;

/**
 * Os conjuntos que a grade mostra: todos menos o original, que vira o botão de restaurar.
 *
 * Calculado fora do componente - a lista não muda em execução, e recalcular a cada render seria
 * trabalho por nada.
 */
const ALTERNATIVOS = PARES_DE_ESTADO.filter((par) => par.id !== PAR_PADRAO.id);

/**
 * A escolha das cores de estado.
 *
 * A escolha e da pessoa, e nao do app: um tema fixo "sem depender de cor" ja existiu aqui, e a
 * medicao o desmontou - simulando as tres formas de daltonismo, aquele par nao era melhor que o
 * verde e vermelho que substituia. Daltonismo nao e uma condicao so, e nenhum conjunto fixo e otimo
 * para as tres.
 *
 * Grade, e nao lista: em 2x2 os conjuntos se comparam de relance, enquanto em lista cada linha se
 * le sozinha e comparar exige percorrer a tela - justamente o que se quer evitar de quem tem
 * dificuldade em ver a diferenca.
 *
 * O conjunto original fica fora da grade porque nao e alternativa entre iguais, e sim o estado de
 * onde se parte: como quinta opcao ele deixaria uma coluna orfa e esconderia, no meio das outras,
 * a que desfaz a escolha.
 */
export function SeletorDeCoresDeEstado() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const { parDeEstado, escolherPar } = useTema();

  return (
    <View style={styles.raiz}>
      {/* A legenda antes das opções: sem saber o que cada faixa significa, as três cores de um
          conjunto são só três cores. */}
      <View style={styles.legenda}>
        <Text style={styles.legendaTitulo}>Legenda</Text>
        <View style={styles.legendaLinha}>
          {ESTADOS.map((estado) => (
            <View key={estado.chave} style={styles.legendaItem}>
              <View style={[styles.legendaPonto, { backgroundColor: parDeEstado[estado.chave] }]} />
              <Text style={styles.legendaTexto} numberOfLines={1}>
                {estado.rotulo}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.grade}>
        {ALTERNATIVOS.map((par) => {
          const selecionado = par.id === parDeEstado.id;

          return (
            <Pressable
              key={par.id}
              style={estadoDePressao([styles.opcao, selecionado && styles.opcaoSelecionada], {
                escala: true,
              })}
              onPress={() => escolherPar(par.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selecionado }}
              accessibilityLabel={`${par.nome}. ${par.descricao}`}>
              {/* Na mesma ordem da legenda: confirmação, atenção, urgência. */}
              <View style={styles.amostra}>
                {ESTADOS.map((estado) => (
                  <View
                    key={estado.chave}
                    style={[styles.faixa, { backgroundColor: par[estado.chave] }]}
                  />
                ))}
              </View>

              {/* O nome traz as **três** cores, na ordem das faixas acima. */}
              <Text style={selecionado ? styles.nomeSelecionado : styles.nome} numberOfLines={2}>
                {par.nome}
              </Text>

              {selecionado ? (
                <Ionicons name="checkmark-circle" size={18} color={cores.corDeDestaque} />
              ) : (
                // Um vazio do mesmo tamanho, para o nome não subir na opção sem o selo.
                <View style={styles.marcaVazia} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Só aparece quando há o que desfazer: com o conjunto original em uso, um botão para
          restaurá-lo não faria nada e ainda sugeriria que algo está fora do lugar. */}
      {parDeEstado.id !== PAR_PADRAO.id ? (
        <Pressable
          style={estadoDePressao(styles.botaoDeRestaurar, { superficie: true })}
          onPress={() => escolherPar(PAR_PADRAO.id)}
          accessibilityRole="button"
          accessibilityLabel="Voltar às cores originais: verde, âmbar e vermelho">
          <Ionicons name="refresh" size={16} color={cores.corDeDestaque} />
          <Text style={styles.textoDeRestaurar}>Voltar às cores originais</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
