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
            <Pressable
              key={isoDay}
              style={styles.celula}
              onPress={() => onSelecionar(isoDay)}
              accessibilityRole="button"
              accessibilityState={{ selected: estaSelecionado }}
              accessibilityLabel={`Dia ${data.getDate()}`}>
              <View
                style={[
                  styles.numeroCirculo,
                  ehHoje && !estaSelecionado && styles.numeroHoje,
                  estaSelecionado && styles.numeroSelecionado,
                ]}>
                <Text
                  style={[
                    styles.numero,
                    estaSelecionado && styles.numeroTextoSelecionado,
                  ]}>
                  {data.getDate()}
                </Text>
              </View>

              {/* Altura reservada mesmo sem ponto: sem isso a linha da grade sobe e desce conforme
                  o mês tem ou não marcação, e o calendário inteiro treme ao trocar de mês. */}
              <View style={styles.pontos}>
                {marca?.temCompromisso ? (
                  <View style={[styles.ponto, styles.pontoDeCompromisso]} />
                ) : null}
                {marca?.temDose ? <View style={[styles.ponto, styles.pontoDeDose]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
