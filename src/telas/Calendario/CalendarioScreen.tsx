import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Appointment, AppointmentOutcome } from "@/domain/entities/appointment";
import type { IntakeStatus } from "@/domain/entities/intake-log";
import {
  doseResolvida,
  useCalendarAgenda,
  type DoseDaAgenda,
} from "@/hooks/use-calendar-agenda";
import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import { dataEHoraPorExtenso, dataPorExtenso, diaEMesCurto } from "@/shared/datas-por-extenso";
import { toLocalIsoDay } from "@/shared/date-input";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { resumirAviso } from "@/shared/rotulos-de-compromisso";
import { colors } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  CenteredLoader,
  Fab,
  Header,
  OptionGroup,
  TextField,
} from "@/ui";
import { styles } from "./CalendarioScreen.styles";

type ItemDeCompromissoProps = {
  appointment: Appointment;
  passado: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** Responder "foi" / "não foi", ou reabrir o que já foi respondido. */
  onResponder: (outcome: AppointmentOutcome) => void;
  onRevisarDesfecho: () => void;
};

function ItemDeCompromisso({
  appointment,
  passado,
  onEdit,
  onDelete,
  onResponder,
  onRevisarDesfecho,
}: ItemDeCompromissoProps) {
  const quando = new Date(appointment.scheduledFor);
  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");
  const resumoDoAviso = resumirAviso(appointment);

  return (
    <View style={[styles.item, passado && styles.itemPassado]}>
      <View style={styles.itemHeader}>
        {/* A hora à esquerda, alinhada com a das doses logo abaixo: é ela que ordena o dia, e
            repetir a data aqui seria dizer de novo o que o cabeçalho do dia já disse. */}
        <Text style={styles.horaDoCompromisso}>
          {horas}:{minutos}
        </Text>

        <View style={styles.itemHeaderText}>
          <Text style={styles.tipo}>{appointment.title}</Text>
          {appointment.professional !== null ? (
            <Text style={styles.quando}>{appointment.professional}</Text>
          ) : null}
        </View>

        {/* Duas ações explícitas, igual à lista de remédios: ao lado de um botão de excluir,
            "toca e abre alguma coisa" não diz o que vai acontecer. */}
        <View style={styles.acoes}>
          <Pressable
            style={styles.acaoBotao}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Ver ou editar ${appointment.title}`}
            hitSlop={6}>
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.acaoBotao}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${appointment.title}`}
            hitSlop={6}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>

      {appointment.location !== null ? (
        <Text style={styles.detalhe}>{appointment.location}</Text>
      ) : null}

      {appointment.notes !== null ? (
        <Text style={styles.observacao}>{appointment.notes}</Text>
      ) : null}

      {/* Só nos que ainda vêm: dizer "avisar 3 dias antes" de uma consulta que já passou descreve
          um aviso que não vai mais acontecer. */}
      {!passado && resumoDoAviso !== null ? (
        <View style={styles.rodapeDoItem}>
          <Ionicons name="notifications-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.aviso}>Lembrar {resumoDoAviso}</Text>
        </View>
      ) : null}

      {/* O desfecho só faz sentido depois que a data passou: perguntar "você foi?" de uma consulta
          da semana que vem convidaria a responder o que ainda não aconteceu. */}
      {passado && appointment.outcome === null ? (
        <View style={styles.perguntaDeDesfecho}>
          <Text style={styles.perguntaTexto}>Você foi?</Text>
          <View style={styles.botoesDeDesfecho}>
            <Pressable
              style={styles.botaoDeDesfecho}
              onPress={() => onResponder("attended")}
              accessibilityRole="button"
              accessibilityLabel="Marcar que compareceu">
              <Ionicons name="checkmark" size={18} color={colors.primary} />
              <Text style={styles.botaoDeDesfechoTexto}>Fui</Text>
            </Pressable>
            <Pressable
              style={styles.botaoDeDesfecho}
              onPress={() => onResponder("missed")}
              accessibilityRole="button"
              accessibilityLabel="Marcar que não compareceu">
              <Ionicons name="close" size={18} color={colors.error} />
              <Text style={styles.botaoDeDesfechoTexto}>Não fui</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {appointment.outcome !== null ? (
        <>
          {/* A linha inteira é o toque: é por ela que se corrige um "não fui" marcado por engano,
              e que se acrescenta depois o que o médico disse. */}
          <Pressable
            style={styles.desfecho}
            onPress={onRevisarDesfecho}
            accessibilityRole="button"
            accessibilityLabel="Alterar o que aconteceu neste compromisso">
            <Ionicons
              name={appointment.outcome === "attended" ? "checkmark-circle" : "close-circle"}
              size={16}
              color={appointment.outcome === "attended" ? colors.primary : colors.error}
            />
            <Text
              style={[
                styles.desfechoTexto,
                appointment.outcome === "attended"
                  ? styles.desfechoCompareceu
                  : styles.desfechoFaltou,
              ]}>
              {appointment.outcome === "attended" ? "Compareceu" : "Não compareceu"}
            </Text>
            <Ionicons name="pencil-outline" size={14} color={colors.outline} />
          </Pressable>

          {appointment.outcomeNotes !== null ? (
            <Text style={styles.anotacaoDoDesfecho}>{appointment.outcomeNotes}</Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

/**
 * A agenda de compromissos: o que vem primeiro, o que já passou depois.
 *
 * Não é uma grade de mês. O calendário mensal mostra bem a distribuição, mas a pergunta que se faz
 * abrindo esta tela é "o que é o próximo, e quando" — e uma lista responde isso sem precisar
 * navegar entre meses para descobrir que o próximo compromisso é só em outubro.
 */
type LinhaDeDoseProps = {
  dose: DoseDaAgenda;
  primeira: boolean;
  /** Ausente quando a dose não aceita ação — futura, ou projetada e sem registro para apontar. */
  onRegistrar?: (status: IntakeStatus) => void;
};

function LinhaDeDose({ dose, primeira, onRegistrar }: LinhaDeDoseProps) {
  const resolvida = doseResolvida(dose);
  const tomada = dose.latestStatus === "confirmed";

  return (
    <View
      style={[
        styles.linhaDeDose,
        !primeira && styles.linhaComDivisoria,
        resolvida && styles.doseResolvida,
      ]}>
      <Text style={styles.horaDaDose}>{dose.time}</Text>
      <View style={styles.textoDaDose}>
        <Text style={styles.nomeDaDose}>{dose.medicationName}</Text>
        <Text style={styles.quantidadeDaDose}>
          {formatarQuantidade(dose.amount, dose.doseUnit)}
        </Text>
      </View>

      {resolvida ? (
        <Ionicons
          name={tomada ? "checkmark-circle" : "close-circle"}
          size={20}
          color={tomada ? colors.primary : colors.error}
        />
      ) : onRegistrar !== undefined ? (
        <View style={styles.acoesDaDose}>
          <Pressable
            style={styles.botaoDaDose}
            onPress={() => onRegistrar("confirmed")}
            accessibilityRole="button"
            accessibilityLabel={`Confirmar ${dose.medicationName} das ${dose.time}`}>
            <Ionicons name="checkmark" size={18} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.botaoDaDose}
            onPress={() => onRegistrar("skipped")}
            accessibilityRole="button"
            accessibilityLabel={`Pular ${dose.medicationName} das ${dose.time}`}>
            <Ionicons name="close" size={18} color={colors.error} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** `2026-08-27` → data local à meia-noite, sem o deslocamento de fuso do `new Date("...")`. */
function dataDoDia(isoDay: string): Date {
  const [ano, mes, dia] = isoDay.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "Hoje", "Amanhã", "Ontem" ou o dia por extenso — é assim que se fala de uma data próxima. */
function tituloDoDia(isoDay: string, hoje: string, amanha: string, ontem: string): string {
  if (isoDay === hoje) return "Hoje";
  if (isoDay === amanha) return "Amanhã";
  if (isoDay === ontem) return "Ontem";
  return dataPorExtenso(dataDoDia(isoDay));
}

export function CalendarioScreen() {
  const router = useRouter();
  const { dias, isLoading, error, reload, registrarDose } = useCalendarAgenda();
  const { excluirCompromisso, registrarDesfecho } = useAppointmentRegistration();
  /** O compromisso com a folha de revisão aberta. `null` = ninguém está revisando nada. */
  const [revisando, setRevisando] = useState<Appointment | null>(null);
  const [outcomeRascunho, setOutcomeRascunho] = useState<AppointmentOutcome | null>(null);
  const [notasRascunho, setNotasRascunho] = useState("");

  // Congelado na abertura: reler o relógio a cada render torna a tela impura e faria "Hoje"
  // escorregar sozinho enquanto alguém está com a lista aberta.
  const [agora] = useState(() => new Date());
  const hoje = toLocalIsoDay(agora);
  const amanha = toLocalIsoDay(new Date(agora.getTime() + 24 * 60 * 60_000));
  const ontem = toLocalIsoDay(new Date(agora.getTime() - 24 * 60 * 60_000));

  const total = dias.length;

  /**
   * Registrar dose direto do calendário, e só onde "tomei" descreve algo que já aconteceu: hoje e
   * nos dias passados. Oferecer o botão numa dose da semana que vem convidaria a marcar o que não
   * aconteceu, e o app passaria a registrar intenção em vez de ingestão — a mesma regra que já
   * governa a Home.
   */
  async function registrar(dose: DoseDaAgenda, status: IntakeStatus) {
    try {
      await registrarDose(dose, status);
    } catch (cause) {
      Alert.alert(
        "Não foi possível registrar",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

  /**
   * "Fui" e "Não fui" gravam na hora, sem diálogo de confirmação.
   *
   * É deliberadamente diferente de confirmar uma dose, que pede confirmação: lá o toque move
   * estoque e entra no cálculo de adesão, e desfazer exige uma correção que gera outro registro.
   * Aqui o desfecho é um estado do próprio compromisso, corrigível em um toque na linha logo
   * abaixo — cobrar um diálogo por algo tão reversível só faria a pessoa parar de responder.
   */
  async function responder(appointment: Appointment, outcome: AppointmentOutcome) {
    try {
      await registrarDesfecho(appointment.id, outcome, appointment.outcomeNotes);
      await reload();
    } catch (cause) {
      Alert.alert(
        "Não foi possível registrar",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

  function abrirRevisao(appointment: Appointment) {
    setOutcomeRascunho(appointment.outcome);
    setNotasRascunho(appointment.outcomeNotes ?? "");
    setRevisando(appointment);
  }

  async function salvarRevisao() {
    if (revisando === null) return;
    const anotacao = notasRascunho.trim();
    try {
      await registrarDesfecho(
        revisando.id,
        outcomeRascunho,
        anotacao.length > 0 ? anotacao : null,
      );
      setRevisando(null);
      await reload();
    } catch (cause) {
      Alert.alert(
        "Não foi possível salvar",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

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
      <Header
        title="Calendário"
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Sua agenda de saúde: compromissos e horários de medicação, dia a dia.
        </Text>
      </View>

      {error !== null ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : total === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Sua agenda está vazia</Text>
          <Text style={styles.emptyDescription}>
            Toque no + para agendar um compromisso ou cadastrar um medicamento — os horários das
            doses aparecem aqui junto das consultas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dias}
          keyExtractor={(dia) => dia.isoDay}
          renderItem={({ item: dia }) => (
            <View style={styles.dia}>
              <View style={styles.diaHeader}>
                <Text style={[styles.diaTitulo, dia.isoDay === hoje && styles.diaHoje]}>
                  {tituloDoDia(dia.isoDay, hoje, amanha, ontem)}
                </Text>
                {/* A data ao lado do "Hoje"/"Amanhã": a palavra situa, o número confere. */}
                {dia.isoDay === hoje || dia.isoDay === amanha || dia.isoDay === ontem ? (
                  <Text style={styles.diaData}>{diaEMesCurto(dataDoDia(dia.isoDay))}</Text>
                ) : null}
              </View>

              {dia.compromissos.map((appointment) => (
                <ItemDeCompromisso
                  key={appointment.id}
                  appointment={appointment}
                  passado={dia.isoDay < hoje}
                  onEdit={() =>
                    router.push({
                      pathname: "/cadastro/editar-compromisso/[id]",
                      params: { id: appointment.id },
                    })
                  }
                  onDelete={() => confirmarExclusao(appointment)}
                  onResponder={(outcome) => void responder(appointment, outcome)}
                  onRevisarDesfecho={() => abrirRevisao(appointment)}
                />
              ))}

              {/* As doses do dia num bloco só, e não um cartão por dose: três doses por dia em
                  trinta dias seriam noventa cartões, e o compromisso do dia 27 se perderia no meio. */}
              {dia.doses.length > 0 ? (
                <View style={styles.blocoDeDoses}>
                  {dia.doses.map((dose, index) => (
                    <LinhaDeDose
                      key={dose.doseScheduleId ?? `${dose.medicationId}-${dose.scheduledFor}`}
                      dose={dose}
                      primeira={index === 0}
                      // Ação só onde "tomei" descreve algo que já aconteceu, e só nas que existem
                      // no banco: a dose projetada não tem registro para apontar.
                      onRegistrar={
                        dia.isoDay <= hoje && dose.doseScheduleId !== null
                          ? (status) => void registrar(dose, status)
                          : undefined
                      }
                    />
                  ))}
                </View>
              ) : null}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomSheet
        visible={revisando !== null}
        onClose={() => setRevisando(null)}
        title="O que aconteceu?">
        <View style={styles.sheetBody}>
          <OptionGroup
            value={outcomeRascunho}
            options={[
              { value: "attended", label: "Fui" },
              { value: "missed", label: "Não fui" },
            ]}
            onChange={setOutcomeRascunho}
          />

          {/* A anotação é o que sobra a longo prazo. O placeholder mostra o tipo de coisa que vale
              a pena guardar, em vez de deixar a pessoa adivinhar o que escrever num campo vazio. */}
          <TextField
            label="ANOTAÇÃO"
            placeholder="Ex: médico pediu hemograma, retorno em 3 meses"
            value={notasRascunho}
            onChangeText={setNotasRascunho}
            multiline
          />

          <Button label="Salvar" onPress={() => void salvarRevisao()} />
          {/* Apagar a resposta devolve o compromisso a "ainda não respondido", que é diferente de
              "não fui" — quem marcou por engano precisa poder voltar ao estado sem resposta. */}
          <Button
            label="Apagar esta resposta"
            variant="text"
            onPress={() => {
              setOutcomeRascunho(null);
              setNotasRascunho("");
            }}
          />
        </View>
      </BottomSheet>

      {/* Aqui o + abre a escolha completa, e não direto o compromisso: o calendário é a agenda de
          tudo que tem hora marcada, então quem chega nele pode estar querendo cadastrar qualquer
          um dos dois. */}
      <Fab
        accessibilityLabel="Cadastrar compromisso ou medicação"
        onPress={() => router.push("/cadastro/escolha")}
      />
    </SafeAreaView>
  );
}
