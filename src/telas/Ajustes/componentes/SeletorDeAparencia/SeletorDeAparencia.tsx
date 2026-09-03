import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import {
  estadoDePressao,
  TEMAS,
  TEMAS_EM_ORDEM,
  useCores,
  useEstilos,
  useTema,
  type PreferenciaDeTema,
} from "@/shared/theme";
import { criarEstilos } from "./SeletorDeAparencia.styles";

/**
 * As opções na ordem em que aparecem: "Automático" primeiro, depois os quatro temas.
 *
 * O automático vem antes porque é a escolha que a maioria quer sem saber que quer — o app
 * acompanha o aparelho e ninguém precisa decidir nada. Os temas de acessibilidade vêm depois do
 * padrão porque quem precisa deles vai procurar; quem não precisa não deve tropeçar neles.
 */
type Opcao = {
  id: PreferenciaDeTema;
  nome: string;
  descricao: string;
  /** As duas cores da amostra: o fundo daquele tema e a cor de ação dele. */
  amostra: { fundo: string; acao: string };
};

function montarOpcoes(esquemaDoSistema: "claro" | "escuro"): Opcao[] {
  const doSistema = esquemaDoSistema === "escuro" ? TEMAS.escuro : TEMAS.padrao;

  return [
    {
      id: "sistema",
      nome: "Automático",
      descricao: "Acompanha o claro e escuro do aparelho.",
      amostra: { fundo: doSistema.cores.background, acao: doSistema.cores.primary },
    },
    ...TEMAS_EM_ORDEM.map((tema) => ({
      id: tema.id,
      nome: tema.nome,
      descricao: tema.descricao,
      amostra: { fundo: tema.cores.background, acao: tema.cores.primary },
    })),
  ];
}

/**
 * A escolha de aparência do app.
 *
 * O tema **Padrão** é o visual próprio do Mapill; os outros três são alternativas de
 * acessibilidade que preservam a mesma estrutura e mudam só o necessário — ver os cabeçalhos em
 * `shared/theme/temas/`.
 *
 * A troca é imediata e sem confirmação: é reversível num toque, e um diálogo de "tem certeza?"
 * para uma escolha visual só atrapalha quem está experimentando qual serve melhor.
 */
export function SeletorDeAparencia() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  const { preferencia, escolher, tema } = useTema();

  const opcoes = montarOpcoes(tema.esquema);

  return (
    <View style={styles.cartao}>
      {opcoes.map((opcao) => {
        const selecionada = preferencia === opcao.id;

        return (
          <Pressable
            key={opcao.id}
            style={estadoDePressao([styles.opcao, selecionada && styles.opcaoSelecionada], {
              superficie: !selecionada,
            })}
            onPress={() => escolher(opcao.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionada }}
            accessibilityLabel={`${opcao.nome}. ${opcao.descricao}`}>
            <View style={styles.amostra}>
              <View style={[styles.amostraFundo, { backgroundColor: opcao.amostra.fundo }]} />
              <View style={[styles.amostraAcao, { backgroundColor: opcao.amostra.acao }]} />
            </View>

            <View style={styles.textos}>
              <Text style={selecionada ? styles.nomeSelecionado : styles.nome}>{opcao.nome}</Text>
              <Text style={[styles.descricao, selecionada && styles.descricaoSelecionada]}>
                {opcao.descricao}
              </Text>
            </View>

            {/* O check só na selecionada. Um círculo vazio em cada linha não escolhida é ruído:
                a ausência do check já diz que ela não está ativa. */}
            {selecionada ? (
              <Ionicons name="checkmark-circle" size={24} color={cores.primary} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
