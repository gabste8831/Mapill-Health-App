import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppointmentList } from "@/hooks/use-appointment-list";
import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import type { Appointment } from "@/domain/entities/appointment";
import { dataEHoraPorExtenso, dataPorExtenso } from "@/shared/datas-por-extenso";
import { useCores, useEstilos } from "@/shared/theme";
import { BottomSheet, CenteredLoader, EstadoDeErro, EstadoVazio, Header } from "@/ui";
import { criarEstilos } from "./CompromissosScreen.styles";

export type CompromissosScreenProps = {
  onBack: () => void;
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
export function CompromissosScreen({ onBack }: CompromissosScreenProps) {
  const styles = useEstilos(criarEstilos);
  const router = useRouter();
  const { items, isLoading, error, reload } = useAppointmentList();
  const { excluirCompromisso } = useAppointmentRegistration();
  // Congelado na abertura, mesmo padrão do Calendário: reler o relógio a cada render tornaria a
  // tela impura, e "passado" escorregaria sozinho enquanto a lista está aberta.
  const [agoraIso] = useState(() => new Date().toISOString());
  const [detalheAberto, setDetalheAberto] = useState<Appointment | null>(null);

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
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemDeCompromisso
              appointment={item}
              passado={item.scheduledFor < agoraIso}
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
          ListHeaderComponent={
            items.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.contagem}>
                  {items.length} {items.length === 1 ? "compromisso cadastrado" : "compromissos cadastrados"}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EstadoVazio
              icone="calendar"
              titulo="Nenhum compromisso cadastrado"
              descricao="Toque no + no Calendário para cadastrar sua primeira consulta ou exame."
            />
          }
        />
      )}

      <BottomSheet
        visible={detalheAberto !== null}
        onClose={() => setDetalheAberto(null)}
        title={detalheAberto?.title ?? ""}>
        {detalheAberto !== null ? <DetalheDoCompromisso appointment={detalheAberto} /> : null}
      </BottomSheet>
    </SafeAreaView>
  );
}
