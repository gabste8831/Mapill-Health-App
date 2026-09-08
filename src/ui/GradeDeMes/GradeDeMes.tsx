import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./GradeDeMes.styles";

/** O que existe num dia — decide quais pontinhos ele mostra. */
export type MarcasDoDia = {
  temCompromisso: boolean;
  temDose: boolean;
};

export type GradeDeMesProps = {
  /** Primeiro dia do mês exibido, em local time. */
  mes: Date;
  /** `YYYY-MM-DD` do dia selecionado. */
  selecionado: string;
  /** `YYYY-MM-DD` de hoje, para o contorno que situa. */
  hoje: string;
  /** O que cada dia tem, indexado por `YYYY-MM-DD`. Dias ausentes não têm marca. */
  marcas: Map<string, MarcasDoDia>;
  onSelecionar: (isoDay: string) => void;
  onMudarMes: (passo: -1 | 1) => void;
};

const DIAS_DA_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function paraIsoDay(data: Date): string {
  const p = (valor: number) => String(valor).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/**
 * As células da grade: os dias do mês, mais o preenchimento para a primeira semana começar no
 * domingo certo. `null` é espaço vazio — não é dia deste mês e não recebe toque.
 */
function celulasDoMes(mes: Date): (Date | null)[] {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const diasNoMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const vazios = Array.from<Date | null>({ length: primeiro.getDay() }).fill(null);
  const dias = Array.from({ length: diasNoMes }, (_, i) =>
    new Date(mes.getFullYear(), mes.getMonth(), i + 1),
  );
  return [...vazios, ...dias];
}

/**
 * Grade mensal com um ponto por tipo de compromisso no dia.
 *
 * Substitui a lista corrida como ponto de entrada da agenda (E1). A lista respondia bem "o que é o
 * próximo", mas com remédio de uso contínuo ela vira dezenas de dias iguais, e a consulta do dia 27
 * se perde no meio. O mês responde outra pergunta — "como está minha semana", "quando é o retorno"
 * — e mostra isso de relance, com o dia cheio marcado e o vazio visivelmente vazio.
 *
 * Dois pontos e não um: compromisso e dose são coisas diferentes, e um ponto só faria "tenho
 * consulta" parecer igual a "tenho remédio pra tomar", que é o que acontece todo dia.
 */
export function GradeDeMes({
  mes,
  selecionado,
  hoje,
  marcas,
  onSelecionar,
  onMudarMes,
}: GradeDeMesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Pressable
          style={styles.navegacao}
          onPress={() => onMudarMes(-1)}
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={cores.onPrimary} />
        </Pressable>

        <Text style={styles.titulo}>
          {MESES[mes.getMonth()]} de {mes.getFullYear()}
        </Text>

        <Pressable
          style={styles.navegacao}
          onPress={() => onMudarMes(1)}
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          hitSlop={8}>
          <Ionicons name="chevron-forward" size={20} color={cores.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.semana}>
        {DIAS_DA_SEMANA.map((dia) => (
          <Text key={dia} style={styles.rotuloDaSemana}>
            {dia}
          </Text>
        ))}
      </View>

      <View style={styles.grade}>
        {celulasDoMes(mes).map((data, index) => {
          if (data === null) return <View key={`vazio-${index}`} style={styles.celula} />;

          const isoDay = paraIsoDay(data);
          const marca = marcas.get(isoDay);
          const estaSelecionado = isoDay === selecionado;
          const ehHoje = isoDay === hoje;

          return (
            /**
             * O `Pressable` envolve **só o círculo**, e não a célula inteira.
             *
             * Envolvendo a célula, o realce do toque era desenhado na área retangular da grade e
             * aparecia como um quadrado claro atrás do dia — inclusive com `android_ripple={null}`,
             * porque o que sobrava não era o ripple e sim o próprio fundo do pressionado, que segue
             * a forma do componente tocado. Com o toque no círculo, o realce não tem como ser
             * quadrado: ele herda o `borderRadius` de quem o desenha.
             *
             * O `hitSlop` devolve a área de dedo que a célula dava. O alvo continua tendo os 34pt
             * do círculo mais 6 de folga em volta — o que se perdeu foi só o retângulo do canto,
             * que ninguém mira.
             */
            <View key={isoDay} style={styles.celula}>
              <Pressable
                onPress={() => onSelecionar(isoDay)}
                android_ripple={null}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityState={{ selected: estaSelecionado }}
                accessibilityLabel={`Dia ${data.getDate()}`}
                style={({ pressed }) => [
                  styles.numeroCirculo,
                  // O contorno só quando hoje **não** é o dia escolhido: selecionado, ele já é o
                  // círculo cheio, e uma borda branca sobre fundo branco não desenha nada.
                  ehHoje && !estaSelecionado && styles.numeroHoje,
                  estaSelecionado && styles.numeroSelecionado,
                  // O retorno do toque, no lugar do ripple: esmaece o círculo, que já é redondo.
                  pressed && styles.numeroPressionado,
                ]}>
                {/* A cor do número acompanha o fundo do círculo, e é por isso que ela é decidida
                    aqui e não por acúmulo de estilos: selecionado, o círculo é branco e o número
                    precisa ser azul; nos demais dias o fundo é a faixa e o número é branco.

                    Hoje **e** selecionado é o caso que quebrava: `numeroHoje` só desenha o contorno
                    e não mexe no texto, então a leitura de qual cor usar tem que vir do fundo real
                    do círculo — que é o `numeroSelecionado`, ganhe ele de quem ganhar. */}
                <Text style={estaSelecionado ? styles.numeroSelecionadoTexto : styles.numero}>
                  {data.getDate()}
                </Text>
              </Pressable>

              {/* Altura reservada mesmo sem ponto: sem isso a linha da grade sobe e desce
                  conforme o mês tem ou não marcação, e o calendário treme ao trocar de mês. */}
              <View style={styles.pontos}>
                {marca?.temCompromisso ? (
                  <View style={[styles.ponto, styles.pontoDeCompromisso]} />
                ) : null}
                {marca?.temDose ? <View style={[styles.ponto, styles.pontoDeDose]} /> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
