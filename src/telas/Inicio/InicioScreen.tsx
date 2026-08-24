import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePatientProfile } from "@/hooks/use-patient-profile";
import { dataPorExtenso } from "@/shared/datas-por-extenso";
import { spacing } from "@/shared/theme";
import { useTodayDoses, type DiaDaSemana, type DoseDoDia } from "@/hooks/use-today-doses";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { CenteredLoader, Fab, Header } from "@/ui";
import { CardAdesaoSemanal } from "@/telas/Inicio/componentes/CardAdesaoSemanal/CardAdesaoSemanal";
import { CardEstoqueBaixo } from "@/telas/Inicio/componentes/CardEstoqueBaixo/CardEstoqueBaixo";
import { CardProximaDose } from "@/telas/Inicio/componentes/CardProximaDose/CardProximaDose";
import { ItemDeDose } from "@/telas/Inicio/componentes/ItemDeDose/ItemDeDose";
import { styles } from "./InicioScreen.styles";

/**
 * Quantas doses o diálogo do lote nomeia antes de resumir o resto. Além disso o texto vira uma
 * parede que ninguém lê — e um alerta que não é lido deixa de prevenir o erro que ele existe pra
 * prevenir.
 */
const MAXIMO_LISTADO_NO_LOTE = 6;

/** O primeiro nome, que é como uma saudação fala. Vazio quando a ficha não tem nome. */
function primeiroNome(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

/** "1 comprimido · Com bastante água" — a dose, e a orientação quando existe. */
function descricaoDaDose(dose: DoseDoDia): string {
  const quantidade = formatarQuantidade(dose.amount, dose.doseUnit);
  return dose.intakeNote ? `${quantidade} · ${dose.intakeNote}` : quantidade;
}

/**
 * A frase do gráfico semanal. Média só dos dias que tiveram dose — incluir os dias vazios como
 * zero faria a adesão de quem toma remédio só às segundas parecer catastrófica.
 */
function resumoDaSemana(semana: DiaDaSemana[]): string {
  const medidos = semana.filter((dia): dia is DiaDaSemana & { ratio: number } => dia.ratio !== null);
  if (medidos.length === 0) return "Ainda não há doses registradas nesta semana.";

  const media = medidos.reduce((soma, dia) => soma + dia.ratio, 0) / medidos.length;
  const porcentagem = Math.round(media * 100);
  const dias = `${medidos.length} ${medidos.length === 1 ? "dia" : "dias"} com doses`;
  return `${porcentagem}% das doses confirmadas, em ${dias} nesta semana.`;
}

export function InicioScreen() {
  const router = useRouter();
  const { draft } = usePatientProfile();
  const { agenda, isLoading, error, registrarDose, registrarDoses } = useTodayDoses();

  const hoje = new Date();
  const nome = primeiroNome(draft?.fullName ?? "");
  const total = agenda.doses.length;
  const progresso = total === 0 ? 0 : agenda.resolvidas / total;
  const proximaDose = agenda.doses.find((dose) => dose.status === "next");
  const atrasadas = agenda.doses.filter((dose) => dose.status === "late");
  const demaisDoses = agenda.doses.filter((dose) => dose.status !== "late");

  /**
   * Confirmar pede confirmação explícita: gravar ingestão é registro clínico, e um toque acidental
   * na lista viraria um dado errado no histórico — que é justamente o que o app existe pra manter
   * confiável.
   */
  function confirmar(dose: DoseDoDia) {
    Alert.alert(
      `Confirmar ${dose.medicationName}?`,
      `${descricaoDaDose(dose)}, das ${dose.time}.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: () => void executar(dose, "confirmed") },
      ],
    );
  }

  function pular(dose: DoseDoDia) {
    Alert.alert(
      `Pular ${dose.medicationName}?`,
      "A dose fica registrada como não tomada. O estoque não é descontado.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Pular", style: "destructive", onPress: () => void executar(dose, "skipped") },
      ],
    );
  }

  /** Tocar numa dose já resolvida: dá pra trocar o desfecho, e o registro antigo é preservado. */
  function corrigir(dose: DoseDoDia) {
    const tomada = dose.status === "confirmed";
    Alert.alert(
      dose.medicationName,
      tomada
        ? "Esta dose está registrada como tomada. Corrigir devolve a quantidade ao estoque."
        : "Esta dose está registrada como pulada.",
      [
        { text: "Fechar", style: "cancel" },
        tomada
          ? { text: "Não tomei", onPress: () => void executar(dose, "skipped") }
          : { text: "Na verdade tomei", onPress: () => void executar(dose, "confirmed") },
      ],
    );
  }

  /**
   * Confirmar as atrasadas de uma vez, para quem ficou longe do celular e só foi olhar mais tarde.
   *
   * Só existe para as **atrasadas**: são as doses cujo horário já passou, ou seja, as únicas em
   * que "tomei" descreve algo que de fato aconteceu. Estender o lote às futuras transformaria o
   * histórico num registro de intenção — o mesmo motivo que já mantém o botão de confirmar fora
   * das doses do fim do dia.
   *
   * A confirmação lista o que vai ser gravado, nome por nome. Uma ação que escreve vários
   * registros clínicos de um toque precisa mostrar o que são, senão a prevenção de erro do
   * diálogo individual se perde justamente onde o estrago é maior.
   */
  function confirmarAtrasadas() {
    const listadas = atrasadas.slice(0, MAXIMO_LISTADO_NO_LOTE);
    const restantes = atrasadas.length - listadas.length;
    const lista = listadas
      .map((dose) => `• ${dose.medicationName} — ${descricaoDaDose(dose)}, das ${dose.time}`)
      .join("\n");

    Alert.alert(
      `Confirmar ${atrasadas.length} doses atrasadas?`,
      `${lista}${restantes > 0 ? `\n• e mais ${restantes}` : ""}\n\nTodas ficam registradas como tomadas agora, e o estoque de cada uma é descontado.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar todas", onPress: () => void executarLote() },
      ],
    );
  }

  async function executarLote() {
    const falhas = await registrarDoses(atrasadas, "confirmed");
    if (falhas.length === 0) return;
    Alert.alert(
      "Nem todas foram registradas",
      `Ficaram de fora: ${falhas.join(", ")}. As demais foram confirmadas — tente estas de novo pela lista.`,
    );
  }

  async function executar(dose: DoseDoDia, status: "confirmed" | "skipped") {
    try {
      await registrarDose(dose, status);
    } catch (cause) {
      Alert.alert(
        "Não foi possível registrar",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

  if (isLoading) return <CenteredLoader />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header onAccount={() => router.push("/ajustes")} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={styles.dateLabel}>{dataPorExtenso(hoje)}</Text>
            <Text style={styles.greeting}>{nome ? `Olá, ${nome}.` : "Olá."}</Text>
          </View>

          {/* Sem dose nenhuma não há progresso a mostrar: 0% de nada lê como fracasso. */}
          {total > 0 ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>PROGRESSO DIÁRIO</Text>
                <Text style={styles.progressValue}>{Math.round(progresso * 100)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progresso * 100}%` }]} />
              </View>
              <Text style={styles.progressCaption}>
                {agenda.resolvidas} de {total} {total === 1 ? "dose concluída" : "doses concluídas"} hoje
              </Text>
            </View>
          ) : null}
        </View>

        {error !== null ? <Text style={styles.errorText}>{error}</Text> : null}

        {proximaDose ? (
          <CardProximaDose
            time={proximaDose.time}
            medicationLabel={`${proximaDose.medicationName} (${formatarQuantidade(proximaDose.amount, proximaDose.doseUnit)})`}
            hint={proximaDose.intakeNote}
          />
        ) : null}

        {/* Atrasadas primeiro e em bloco próprio: misturadas na agenda elas passam despercebidas
            justamente por estarem na posição de horário já vencido, no alto da lista. */}
        {atrasadas.length > 0 ? (
          <View style={styles.doseList}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>
                {atrasadas.length === 1 ? "Dose atrasada" : `${atrasadas.length} doses atrasadas`}
              </Text>
              {/* Com uma só, o lote não economiza toque nenhum e ainda oferece dois caminhos
                  para a mesma coisa. */}
              {atrasadas.length > 1 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Confirmar as ${atrasadas.length} doses atrasadas`}
                  // O texto é curto e o alvo real precisa ser de dedo, não de letra — o público
                  // do app inclui quem já não acerta um toque pequeno.
                  hitSlop={spacing.sm}
                  onPress={confirmarAtrasadas}>
                  <Text style={styles.bulkAction}>Confirmar todas</Text>
                </Pressable>
              ) : null}
            </View>
            {atrasadas.map((dose) => (
              <ItemDeDose
                key={dose.doseScheduleId}
                time={dose.time}
                medicationName={dose.medicationName}
                note={descricaoDaDose(dose)}
                status={dose.status}
                onConfirm={() => confirmar(dose)}
                onSkip={() => pular(dose)}
                onCorrect={() => corrigir(dose)}
              />
            ))}
          </View>
        ) : null}

        {total === 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>Hoje</Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {agenda.temMedicamentos ? "Nenhuma dose para hoje" : "Nenhum remédio cadastrado"}
              </Text>
              <Text style={styles.emptyDescription}>
                {agenda.temMedicamentos
                  ? "Seus tratamentos não têm dose marcada para hoje."
                  : "Toque no + para cadastrar seu primeiro medicamento e ver a agenda do dia aqui."}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Só quando sobra alguma fora do bloco de atrasadas: um cabeçalho "Hoje" sem nada
            embaixo dele lê como lista que falhou em carregar. */}
        {demaisDoses.length > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>Hoje</Text>
            {demaisDoses.map((dose) => (
              <ItemDeDose
                key={dose.doseScheduleId}
                time={dose.time}
                medicationName={dose.medicationName}
                note={descricaoDaDose(dose)}
                status={dose.status}
                onConfirm={() => confirmar(dose)}
                onSkip={() => pular(dose)}
                onCorrect={() => corrigir(dose)}
              />
            ))}
          </View>
        ) : null}

        {/* Só com algum dia medido: um gráfico de sete traços vazios não informa nada. */}
        {agenda.semana.some((dia) => dia.ratio !== null) ? (
          <CardAdesaoSemanal days={agenda.semana} summary={resumoDaSemana(agenda.semana)} />
        ) : null}

        {agenda.estoquesBaixos.map(({ medication, inventory, daysRemaining }) => (
          <CardEstoqueBaixo
            key={inventory.id}
            medicationName={medication.name}
            daysRemaining={daysRemaining}
            onUpdateMedication={() =>
              router.push({ pathname: "/cadastro/editar/[id]", params: { id: medication.id } })
            }
          />
        ))}
      </ScrollView>

      <Fab
        accessibilityLabel="Cadastrar medicação ou compromisso"
        onPress={() => router.push("/cadastro/escolha")}
      />
    </SafeAreaView>
  );
}
