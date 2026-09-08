import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppointmentList } from "@/hooks/use-appointment-list";
import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import type { Appointment } from "@/domain/entities/appointment";
import { dataEHoraPorExtenso, dataPorExtenso } from "@/shared/datas-por-extenso";
import { normalizarBusca } from "@/shared/normalizar-busca";
import { useCores, useEstilos } from "@/shared/theme";
import {
  Accordion,
  BottomSheet,
  CenteredLoader,
  EstadoDeErro,
  EstadoVazio,
  Fab,
  Header,
  SearchField,
} from "@/ui";
import { criarEstilos } from "./CompromissosScreen.styles";

export type CompromissosScreenProps = {
  onBack: () => void;
  /**
   * Abre o detalhe deste compromisso assim que a lista carrega. Vem do card da Home, que leva a um
   * compromisso específico e não à lista inteira.
   */
  detalheInicialId?: string;
};

const MESES_ABREVIADOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

type ItemDeCompromissoProps = {
  appointment: Appointment;
  passado: boolean;
  onAbrirDetalhe: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function ItemDeCompromisso({
  appointment,
  passado,
  onAbrirDetalhe,
  onEdit,
  onDelete,
}: ItemDeCompromissoProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const quando = new Date(appointment.scheduledFor);
  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");

  // A data já está na coluna colorida — aqui só o que falta dizer: horário e onde/com quem.
  // Duas linhas de leitura corrida, e não três colunas disputando largura entre si, que era o que
  // fazia o título quebrar sem necessidade num nome um pouco mais longo.
  const localEProfissional = [appointment.location, appointment.professional]
    .filter((valor): valor is string => valor !== null)
    .join(" · ");

  return (
    <View style={[styles.item, passado && styles.itemPassado]}>
      {/* O card inteiro (menos a faixa de ações abaixo) abre o detalhe completo — é onde cabe o
          que a lista não tem espaço para mostrar: observação, antecedência do aviso, desfecho. */}
      <Pressable
        style={styles.itemHeader}
        onPress={onAbrirDetalhe}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${appointment.title}`}>
        <View style={styles.dataColuna}>
          <Text style={styles.diaDoMes}>{quando.getDate()}</Text>
          <Text style={styles.mesAbreviado}>{MESES_ABREVIADOS[quando.getMonth()]}</Text>
        </View>

        <View style={styles.itemTexto}>
          <Text style={styles.titulo} numberOfLines={1}>
            {appointment.title}
          </Text>
          <Text style={styles.horaEProfissional} numberOfLines={1}>
            {horas}:{minutos}
            {localEProfissional.length > 0 ? ` · ${localEProfissional}` : ""}
          </Text>
        </View>
      </Pressable>

      {/* Editar/excluir dividindo a largura ao meio, separadas do toque em "ver detalhe" para as
          duas ações continuarem explícitas (nunca escondidas atrás de um gesto), sem competir
          mais pela largura do título. */}
      <View style={styles.acoes}>
        <Pressable
          style={styles.acaoBotao}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Editar ${appointment.title}`}
          hitSlop={6}>
          <Ionicons name="pencil-outline" size={16} color={cores.corDeDestaque} />
          <Text style={styles.acaoTexto}>Editar</Text>
        </Pressable>
        <View style={styles.acaoDivisor} />
        <Pressable
          style={styles.acaoBotao}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${appointment.title}`}
          hitSlop={6}>
          <Ionicons name="trash-outline" size={16} color={cores.error} />
          <Text style={[styles.acaoTexto, styles.acaoTextoDestrutivo]}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

type LinhaDeDetalheProps = {
  rotulo: string;
  valor: string;
};

function LinhaDeDetalhe({ rotulo, valor }: LinhaDeDetalheProps) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.detalheLinha}>
      <Text style={styles.detalheRotulo}>{rotulo}</Text>
      <Text style={styles.detalheValor}>{valor}</Text>
    </View>
  );
}

const RESUMO_DO_OUTCOME: Record<string, string> = {
  attended: "Compareceu",
  missed: "Não compareceu",
};

const RESUMO_DO_AVISO_ON_DAY = "No dia";

/** Popup com tudo que o card não tem espaço para mostrar. */
function DetalheDoCompromisso({ appointment }: { appointment: Appointment }) {
  const styles = useEstilos(criarEstilos);
  const quando = new Date(appointment.scheduledFor);
  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");

  const avisos: string[] = [];
  if (appointment.reminderLeadDays !== null) {
    avisos.push(
      `${appointment.reminderLeadDays} ${appointment.reminderLeadDays === 1 ? "dia antes" : "dias antes"}`,
    );
  }
  if (appointment.reminderOnDay) avisos.push(RESUMO_DO_AVISO_ON_DAY);

  return (
    <View style={styles.detalheBloco}>
      <LinhaDeDetalhe rotulo="Quando" valor={`${dataPorExtenso(quando)}, ${horas}:${minutos}`} />
      {appointment.location !== null ? (
        <LinhaDeDetalhe rotulo="Onde" valor={appointment.location} />
      ) : null}
      {appointment.professional !== null ? (
        <LinhaDeDetalhe rotulo="Profissional" valor={appointment.professional} />
      ) : null}
      {avisos.length > 0 ? (
        <LinhaDeDetalhe rotulo="Aviso" valor={avisos.join(" · ")} />
      ) : null}
      {appointment.notes !== null ? (
        <LinhaDeDetalhe rotulo="Preparo" valor={appointment.notes} />
      ) : null}
      {appointment.outcome !== null ? (
        <LinhaDeDetalhe rotulo="Desfecho" valor={RESUMO_DO_OUTCOME[appointment.outcome]} />
      ) : null}
      {appointment.outcomeNotes !== null ? (
        <LinhaDeDetalhe rotulo="Anotação" valor={appointment.outcomeNotes} />
      ) : null}
    </View>
  );
}

/**
 * Todos os compromissos cadastrados, num lugar só — o que faltava desde que a agenda do Calendário
 * só mostra o dia selecionado. Mesmo modelo da tela de Remédios: lista, editar e excluir.
 *
 * A resposta de desfecho ("foi" / "não foi") **não mora aqui**: ela é uma ação do dia, e pertence
 * à tela onde o dia já está aberto (Calendário). Duplicá-la aqui obrigaria a mesma pergunta a
 * aparecer em dois lugares diferentes da interface.
 */
export function CompromissosScreen({ onBack, detalheInicialId }: CompromissosScreenProps) {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const { items, isLoading, error, reload } = useAppointmentList();
  const { excluirCompromisso } = useAppointmentRegistration();
  // Congelado na abertura, mesmo padrão do Calendário: reler o relógio a cada render tornaria a
  // tela impura, e "passado" escorregaria sozinho enquanto a lista está aberta.
  const [agoraIso] = useState(() => new Date().toISOString());
  const [detalheAberto, setDetalheAberto] = useState<Appointment | null>(null);
  const [busca, setBusca] = useState("");
  /**
   * Se o detalhe pedido pela rota já foi mostrado.
   *
   * Ele é uma intenção de **abertura**, não um estado: sem esta trava, fechar o popup e ter a lista
   * recarregada (ao voltar do editar, por exemplo) o abriria de novo, e o popup ficaria impossível
   * de dispensar.
   */
  const [detalheInicialUsado, setDetalheInicialUsado] = useState(detalheInicialId === undefined);

  /**
   * O detalhe pedido pela rota, assim que a lista o contém.
   *
   * Ajuste no render em vez de `useEffect` com `setState`: o React Compiler recusa efeitos que só
   * derivam estado de props, e aqui não há nada a sincronizar com o mundo de fora — é só semear o
   * mesmo estado que o toque na lista alimenta, para que fechar o popup funcione igual nos dois
   * caminhos.
   */
  if (!detalheInicialUsado) {
    const daRota = items.find((item) => item.id === detalheInicialId);
    if (daRota !== undefined) {
      setDetalheInicialUsado(true);
      setDetalheAberto(daRota);
    }
  }

  const termo = normalizarBusca(busca.trim());
  /**
   * Busca por título, profissional e local.
   *
   * Os três porque são as três formas de lembrar de uma consulta: pelo que é ("cardiologista"), por
   * quem atende ("Dra. Helena") ou por onde é ("Clínica São José"). Quem procura raramente lembra
   * qual dos três digitou no cadastro — e exigir o campo certo transformaria a busca num quiz.
   */
  const encontrados =
    termo.length === 0
      ? items
      : items.filter((item) =>
          [item.title, item.professional, item.location].some(
            (campo) => campo !== null && normalizarBusca(campo).includes(termo),
          ),
        );

  /**
   * Próximos em cima, anteriores dobrados embaixo.
   *
   * Compromisso passado é registro clínico — "fui ao cardiologista em março, ele pediu hemograma" é
   * o que se leva à consulta seguinte, e é para isso que existe `outcomeNotes`. Some da lista e o
   * app perde o histórico que promete; riscado, fica ilegível. Mas ele também não pode competir com
   * o que ainda vai acontecer, que é o motivo de alguém abrir esta tela.
   *
   * Então o histórico fica íntegro e recolhido, com a contagem no título — mesmo padrão das doses
   * não tomadas na tela de adesão.
   */
  const proximos = encontrados.filter((item) => item.scheduledFor >= agoraIso);
  const anteriores = encontrados.filter((item) => item.scheduledFor < agoraIso);

  /** O total de próximos ignorando a busca — o denominador do "X de Y" enquanto se digita. */
  const totalDeProximos = items.filter((item) => item.scheduledFor >= agoraIso).length;

  function confirmarExclusao(appointment: Appointment) {
    Alert.alert(
      `Excluir ${appointment.title}?`,
      `${dataEHoraPorExtenso(new Date(appointment.scheduledFor))}. O compromisso sai da sua agenda e o aviso, se houver, deixa de existir.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirCompromisso(appointment.id);
              await reload();
            } catch (cause) {
              Alert.alert(
                "Não foi possível excluir",
                cause instanceof Error ? cause.message : "Tente novamente em instantes.",
              );
            }
          },
        },
      ],
    );
  }

  if (isLoading) return <CenteredLoader />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Compromissos" onBack={onBack} />
      {error !== null ? (
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      ) : (
        <FlatList
          data={proximos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemDeCompromisso
              appointment={item}
              passado={false}
              onAbrirDetalhe={() => setDetalheAberto(item)}
              onEdit={() =>
                router.push({
                  pathname: "/cadastro/editar-compromisso/[id]",
                  params: { id: item.id },
                })
              }
              onDelete={() => confirmarExclusao(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // As mesmas duas props da lista de Remédios: esta tela tem campo de busca mas não é
          // formulário, então precisa da própria saída para o teclado.
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            items.length > 0 ? (
              <View style={styles.listHeader}>
                <SearchField
                  value={busca}
                  onChangeText={setBusca}
                  // Curto para caber numa linha: o placeholder que enumerava os três campos
                  // ("consulta, profissional ou local") quebrava e desalinhava a caixa. A busca
                  // continua olhando os três — o texto é convite, não especificação.
                  placeholder="Buscar compromisso"
                  style={styles.busca}
                />
                {/* Conta só o que ainda não passou.

                    A contagem descreve a lista logo abaixo dela, e ali só estão os próximos — o
                    histórico tem a própria contagem no título do acordeão. Somando os dois, "2
                    compromissos" com um único cartão visível parecia erro.

                    Durante a busca, o denominador também é só dos próximos, pelo mesmo motivo: "1 de
                    2" com um resultado à vista e o outro escondido no histórico não se explica. */}
                <Text style={styles.contagem}>
                  {termo.length > 0
                    ? `${proximos.length} de ${totalDeProximos} ${totalDeProximos === 1 ? "compromisso" : "compromissos"}`
                    : `${proximos.length} ${proximos.length === 1 ? "compromisso agendado" : "compromissos agendados"}`}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            items.length === 0 ? (
              <EstadoVazio
                icone="calendar"
                titulo="Nenhum compromisso cadastrado"
                descricao="Toque no + para cadastrar sua primeira consulta ou exame."
              />
            ) : /* Só quando a busca não achou nada em lugar nenhum. Sem busca, a contagem logo
                  acima já diz "0 compromissos agendados", e repetir isso num bloco próprio seria
                  dizer duas vezes o mesmo — ainda mais com o histórico visível logo abaixo. */
            termo.length > 0 && anteriores.length === 0 ? (
              <Text style={styles.semResultado}>Nenhum compromisso encontrado.</Text>
            ) : null
          }
          ListFooterComponent={
            anteriores.length > 0 ? (
              <View
                style={[
                  styles.blocoAnteriores,
                  proximos.length === 0 && styles.blocoAnterioresSozinho,
                ]}>
                {/* Só quando há algo acima para separar: com a agenda vazia, um traço solto no topo
                    da tela não divide nada. */}
                {proximos.length > 0 ? <View style={styles.divisorDeEscopo} /> : null}
                <Accordion
                  style={styles.acordeaoAnteriores}
                  title={
                    anteriores.length === 1 ? "1 anterior" : `${anteriores.length} anteriores`
                  }
                  toggleLabel>
                  {anteriores.map((item) => (
                    <ItemDeCompromisso
                      key={item.id}
                      appointment={item}
                      passado
                      onAbrirDetalhe={() => setDetalheAberto(item)}
                      onEdit={() =>
                        router.push({
                          pathname: "/cadastro/editar-compromisso/[id]",
                          params: { id: item.id },
                        })
                      }
                      onDelete={() => confirmarExclusao(item)}
                    />
                  ))}
                </Accordion>
              </View>
            ) : null
          }
        />
      )}

      {/* Vai direto ao formulário de compromisso, sem passar pela pergunta "medicação ou
          compromisso?": quem está nesta lista já respondeu, ao estar aqui, o que vai cadastrar —
          mesma razão pela qual o + da lista de Remédios pula a escolha.

          Fora do `FlatList` para existir também com a lista vazia, que era justamente o caso em que
          não havia como cadastrar nada: o estado vazio mandava voltar ao Calendário. */}
      <Fab
        accessibilityLabel="Cadastrar compromisso"
        onPress={() => router.push("/cadastro/compromisso")}
      />

      <BottomSheet
        visible={detalheAberto !== null}
        onClose={() => setDetalheAberto(null)}
        title={detalheAberto?.title ?? ""}>
        {detalheAberto !== null ? <DetalheDoCompromisso appointment={detalheAberto} /> : null}
      </BottomSheet>
    </SafeAreaView>
  );
}
