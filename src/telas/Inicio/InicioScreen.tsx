import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppointmentList } from "@/hooks/use-appointment-list";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { dataPorExtenso } from "@/shared/datas-por-extenso";
import { toLocalIsoDay } from "@/shared/date-input";
import { spacing, useEstilos } from "@/shared/theme";
import { useTodayDoses, type DiaDaSemana, type DoseDoDia } from "@/hooks/use-today-doses";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { BarraDeProgresso, CenteredLoader, Fab, Header, SuccessOverlay } from "@/ui";
import { CardAdesaoSemanal } from "@/telas/Inicio/componentes/CardAdesaoSemanal/CardAdesaoSemanal";
import { PainelDePermissoes } from "@/ui/PainelDePermissoes/PainelDePermissoes";
import { CardEstoque } from "@/telas/Inicio/componentes/CardEstoque/CardEstoque";
import { CardEstoqueBaixo } from "@/telas/Inicio/componentes/CardEstoqueBaixo/CardEstoqueBaixo";
import { CardProximaDose } from "@/telas/Inicio/componentes/CardProximaDose/CardProximaDose";
import { ItemDeCompromisso } from "@/telas/Inicio/componentes/ItemDeCompromisso/ItemDeCompromisso";
import { ItemDeDose } from "@/telas/Inicio/componentes/ItemDeDose/ItemDeDose";
import { criarEstilos } from "./InicioScreen.styles";

/**
 * Quantas doses o diálogo do lote nomeia antes de resumir o resto. Além disso o texto vira uma
 * parede que ninguém lê — e um alerta que não é lido deixa de prevenir o erro que ele existe pra
 * prevenir.
 */
const MAXIMO_LISTADO_NO_LOTE = 6;

/** Atraso entre uma linha e a seguinte na entrada da agenda. */
const ESCALONAMENTO_MS = 45;

/**
 * Quantas linhas participam do escalonamento.
 *
 * Depois disso o atraso é o mesmo para todas: com dez remédios, esperar meio segundo pela última
 * linha aparecer não é elegância, é a tela demorando a ficar pronta. O teto mantém a impressão de
 * cascata em quem tem poucas doses sem punir quem tem muitas.
 */
const MAXIMO_ESCALONADO = 6;

/**
 * A entrada de uma linha da agenda: sobe um pouco enquanto aparece, atrasada pela posição.
 *
 * O deslocamento é pequeno de propósito — a lista chega de baixo o suficiente para o olho seguir a
 * ordem de cima para baixo, sem que a tela pareça montar-se peça por peça toda vez que alguém abre
 * a Home.
 */
function entradaEscalonada(indice: number) {
  return FadeInDown.duration(260)
    .delay(Math.min(indice, MAXIMO_ESCALONADO) * ESCALONAMENTO_MS)
    .withInitialValues({ transform: [{ translateY: 8 }] });
}

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
  const styles = useEstilos(criarEstilos);

  const router = useRouter();
  const { draft } = usePatientProfile();
  const { agenda, isLoading, error, reload, registrarDose, registrarDoses } = useTodayDoses();
  // Só a lista importa aqui: o carregamento é coberto pelo da agenda, e um erro de compromisso não
  // pode esconder as doses do dia — a seção simplesmente não aparece.
  const { items: compromissos } = useAppointmentList();
  const { permissao, pedir } = useNotificationPermission();
  const permissoesDoAlarme = usePermissoesDeAlarme();

  const hoje = new Date();
  const nome = primeiroNome(draft?.fullName ?? "");
  const total = agenda.doses.length;
  const progresso = total === 0 ? 0 : agenda.resolvidas / total;

  const semMovimento = useReducedMotion();

  /**
   * O `SuccessOverlay` do dia fechado — a pausa que celebra **algo que de fato terminou**.
   *
   * ## Por que aqui e não a cada dose
   *
   * O overlay é de tela cheia e dura quase três segundos. Emendá-lo em cada confirmação
   * transformaria o gesto mais repetido do app no mais demorado, e no lote de atrasadas dispararia
   * várias vezes seguidas. A linha que se acomoda já dá a confirmação do gesto individual; o
   * overlay fica para o único momento em que há um marco: a última dose do dia.
   *
   * ## Por que comparar com o render anterior, e não testar `progresso === 1`
   *
   * A condição precisa ser a **transição** para o dia completo, não o estado. Quem abre a Home às
   * 22h com tudo já confirmado não acabou de fazer nada — receberia uma comemoração por existir, e
   * a mesma voltaria a cada `reload`.
   *
   * Guardar o valor anterior em **estado** é o padrão que o React documenta para isto (ajustar
   * estado quando algo muda entre renders): o `set` durante o render é descartado se o componente
   * renderizar de novo antes de pintar, então nenhum quadro chega à tela sem o overlay que deveria
   * ter — e, ao contrário de um ref, nada é escondido do React.
   */
  const diaFechado = total > 0 && agenda.resolvidas === total;
  const [diaFechadoAntes, setDiaFechadoAntes] = useState(diaFechado);
  const [comemorar, setComemorar] = useState(false);

  if (diaFechadoAntes !== diaFechado) {
    setDiaFechadoAntes(diaFechado);
    // Só a passagem para fechado comemora. O caminho de volta (uma correção retroativa reabre o
    // dia) apenas atualiza a memória, sem festejar o desfazer.
    if (diaFechado) setComemorar(true);
  }
  const proximaDose = agenda.doses.find((dose) => dose.status === "next");
  const atrasadas = agenda.doses.filter((dose) => dose.status === "late");

  /**
   * O que ainda espera resposta vem antes do que já foi registrado.
   *
   * A ordem era cronológica pura, e o efeito aparecia no fim do dia: quem já confirmou as doses da
   * manhã abria a Home e via primeiro o que **já resolveu** — precisava rolar para achar o que
   * falta, que é a única coisa que a tela pede dele. Invertido, a primeira linha é sempre uma
   * pergunta em aberto.
   *
   * Dentro de cada grupo a ordem do horário se mantém: ela é a leitura do dia, e embaralhá-la por
   * ordem de confirmação faria a dose das 8h aparecer depois da de 14h sem explicação.
   *
   * As atrasadas ficam de fora dos dois: elas já têm bloco próprio acima, com destaque.
   */
  const pendentesDeHoje = agenda.doses.filter(
    (dose) => dose.status !== "late" && dose.status !== "confirmed" && dose.status !== "skipped",
  );
  const registradasDeHoje = agenda.doses.filter(
    (dose) => dose.status === "confirmed" || dose.status === "skipped",
  );

  /**
   * Os compromissos de hoje, na mesma agenda das doses.
   *
   * A Home respondia "o que tomo hoje?" e deixava de fora a consulta das 14h — que é parte do mesmo
   * dia e, muitas vezes, o compromisso de saúde mais importante dele. Quem tinha os dois precisava
   * abrir o Calendário para lembrar de um deles.
   *
   * Comparação pelo dia local (`toLocalIsoDay`) e não pelo ISO cru: `scheduledFor` é um instante em
   * UTC, e uma consulta das 21h no Brasil cai no dia seguinte se comparada como texto.
   */
  const hojeIso = toLocalIsoDay(hoje);
  const compromissosDeHoje = compromissos.filter(
    (compromisso) => toLocalIsoDay(new Date(compromisso.scheduledFor)) === hojeIso,
  );

  /**
   * O painel de permissões aparece quando falta algo **e** existe tratamento esperando aviso.
   *
   * A segunda condição é o que impede o app de cobrar autorização de quem nunca pediu lembrete
   * nenhum — permissão que não muda nada na vida da pessoa é o tipo de aviso que ensina a ignorar
   * os próximos.
   */
  const cobrarPermissoes = permissoesDoAlarme.temPendencia && agenda.tratamentosComLembrete > 0;

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
      // Dois pontos separando o nome da quantidade, como no corpo do aviso (`planejarAvisosDeDose`).
      .map((dose) => `• ${dose.medicationName}: ${descricaoDaDose(dose)}, das ${dose.time}`)
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
      `Ficaram de fora: ${falhas.join(", ")}. As demais foram confirmadas. Tente estas de novo pela lista.`,
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
              <BarraDeProgresso
                valor={progresso}
                trackStyle={styles.progressTrack}
                fillStyle={styles.progressFill}
                accessibilityLabel="Progresso das doses de hoje"
              />
              <Text style={styles.progressCaption}>
                {agenda.resolvidas} de {total} {total === 1 ? "dose concluída" : "doses concluídas"} hoje
              </Text>
            </View>
          ) : null}
        </View>

        {/* Aqui o erro **não** toma a tela: a Home tem a saudação, o progresso e os cards, e
            substituir tudo por um aviso apagaria o contexto de quem só queria ver o dia. A linha
            com "tentar de novo" resolve sem esconder o resto. */}
        {error !== null ? (
          <View style={styles.erroInline}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void reload()} accessibilityRole="button" hitSlop={spacing.sm}>
              <Text style={styles.erroAcao}>Tentar de novo</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Antes da agenda, e não no fim: ele muda o que toda a lista abaixo significa. Ler os
            horários primeiro e descobrir depois que nenhum deles vai tocar é a ordem errada. */}
        {cobrarPermissoes ? (
          <PainelDePermissoes
            itens={permissoesDoAlarme.itens}
            vaiTocar={permissoesDoAlarme.vaiTocar}
            /**
             * O botão de pedir só existe enquanto o diálogo do sistema ainda abre. Depois de negada,
             * `requestPermission` retorna na hora sem mostrar nada — e um botão que não faz nada é
             * pior que botão nenhum. Aí sobram os itens da lista, que levam à tela do sistema.
             */
            onPedirTudo={
              permissao === "naoPedida"
                ? () => {
                    void pedir();
                    void permissoesDoAlarme.consultar();
                  }
                : undefined
            }
          />
        ) : null}

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
            {atrasadas.map((dose, indice) => (
              <Animated.View
                key={dose.doseScheduleId}
                entering={semMovimento ? undefined : entradaEscalonada(indice)}>
                <ItemDeDose
                  time={dose.time}
                  medicationName={dose.medicationName}
                  note={descricaoDaDose(dose)}
                  status={dose.status}
                  onConfirm={() => confirmar(dose)}
                  onSkip={() => pular(dose)}
                  onCorrect={() => corrigir(dose)}
                />
              </Animated.View>
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
              {/* Com compromisso no dia, "não há nada hoje" seria falso — o bloco deles vem logo
                  abaixo. O texto muda para dizer que faltam doses, não o dia inteiro. */}
              <Text style={styles.emptyDescription}>
                {agenda.temMedicamentos
                  ? "Seus tratamentos não têm dose marcada para hoje."
                  : compromissosDeHoje.length > 0
                    ? "Nenhum remédio cadastrado ainda. Seus compromissos de hoje estão logo abaixo."
                    : "Toque no + para cadastrar seu primeiro medicamento e ver a agenda do dia aqui."}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Só quando sobra alguma fora do bloco de atrasadas: um cabeçalho "Hoje" sem nada
            embaixo dele lê como lista que falhou em carregar. */}
        {pendentesDeHoje.length > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>Hoje</Text>
            {pendentesDeHoje.map((dose, indice) => (
              <Animated.View
                key={dose.doseScheduleId}
                /**
                 * O escalonamento continua **de onde as atrasadas pararam**: as duas listas são
                 * blocos visuais distintos, mas uma sequência só descendo a tela. Reiniciar o atraso
                 * no zero faria a segunda lista brotar junto com o meio da primeira.
                 */
                entering={semMovimento ? undefined : entradaEscalonada(atrasadas.length + indice)}>
                <ItemDeDose
                  time={dose.time}
                  medicationName={dose.medicationName}
                  note={descricaoDaDose(dose)}
                  status={dose.status}
                  onConfirm={() => confirmar(dose)}
                  onSkip={() => pular(dose)}
                  onCorrect={() => corrigir(dose)}
                />
              </Animated.View>
            ))}
          </View>
        ) : null}

        {/* O que já foi respondido, depois do que ainda espera. O rótulo próprio é o que explica a
            quebra na ordem dos horários: sem ele, a dose das 08:00 abaixo da de 14:00 lê como
            defeito de ordenação em vez de agrupamento. */}
        {registradasDeHoje.length > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>Já registradas</Text>
            {registradasDeHoje.map((dose, indice) => (
              <Animated.View
                key={dose.doseScheduleId}
                entering={
                  semMovimento
                    ? undefined
                    : entradaEscalonada(atrasadas.length + pendentesDeHoje.length + indice)
                }>
                <ItemDeDose
                  time={dose.time}
                  medicationName={dose.medicationName}
                  note={descricaoDaDose(dose)}
                  status={dose.status}
                  onConfirm={() => confirmar(dose)}
                  onSkip={() => pular(dose)}
                  onCorrect={() => corrigir(dose)}
                />
              </Animated.View>
            ))}
          </View>
        ) : null}

        {/* Os compromissos vêm **depois** das doses, e em bloco próprio.

            Depois porque a dose é o que o app cobra ação: ela tem horário curto, botões e um estado
            que vence. O compromisso é do dia inteiro do ponto de vista de quem o lê aqui — saber que
            há consulta às 14h muda o planejamento, mas não pede toque nenhum agora.

            Em bloco próprio, e não intercalados por horário na mesma lista, porque as duas linhas se
            respondem de formas diferentes: misturadas, a consulta apareceria entre duas doses
            pedindo "Confirmar" e "Pular", e a ausência desses botões nela leria como falta. */}
        {compromissosDeHoje.length > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>
              {compromissosDeHoje.length === 1
                ? "Compromisso de hoje"
                : `${compromissosDeHoje.length} compromissos de hoje`}
            </Text>
            {compromissosDeHoje.map((compromisso, indice) => (
              <Animated.View
                key={compromisso.id}
                /**
                 * A cascata continua de onde a agenda parou: as três listas são blocos distintos,
                 * mas uma sequência só descendo a tela.
                 */
                entering={
                  semMovimento
                    ? undefined
                    : entradaEscalonada(
                        atrasadas.length +
                          pendentesDeHoje.length +
                          registradasDeHoje.length +
                          indice,
                      )
                }>
                <ItemDeCompromisso
                  time={new Date(compromisso.scheduledFor).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  title={compromisso.title}
                  location={compromisso.location}
                  outcome={compromisso.outcome}
                />
              </Animated.View>
            ))}
          </View>
        ) : null}

        {/* Só com algum dia medido: um gráfico de sete traços vazios não informa nada. */}
        {agenda.semana.some((dia) => dia.ratio !== null) ? (
          <CardAdesaoSemanal
            days={agenda.semana}
            summary={resumoDaSemana(agenda.semana)}
            onAbrirRelatorio={() => router.push("/adesao")}
          />
        ) : null}

        {/* Acesso permanente ao estoque, e não só quando algo está acabando: o ícone no topo da
            aba Medicações passou despercebido no teste em aparelho. Some quando não há estoque
            controlado — aí a tela do outro lado abriria vazia. */}
        {agenda.estoquesControlados > 0 ? (
          <CardEstoque
            quantidade={agenda.estoquesControlados}
            onPress={() => router.push("/estoque")}
          />
        ) : null}

        {agenda.estoquesBaixos.map(({ medication, inventory, daysRemaining }) => (
          <CardEstoqueBaixo
            key={inventory.id}
            medicationName={medication.name}
            daysRemaining={daysRemaining}
            // Vai pro estoque, não pro cadastro: quem viu "acaba em 3 dias" quer repor, e repor
            // pelo formulário do remédio obrigaria a reeditar um tratamento que não mudou.
            onAbrirEstoque={() => router.push("/estoque")}
          />
        ))}
      </ScrollView>

      <Fab
        accessibilityLabel="Cadastrar medicação ou compromisso"
        onPress={() => router.push("/cadastro/escolha")}
      />

      {/**
       * A comemoração do dia fechado.
       *
       * Fica **fora** do `ScrollView` e depois do `Fab` para cobrir a tela inteira, e some sozinha —
       * `onDone` só desliga o estado, sem navegar: quem fechou o dia continua na Home, que é onde
       * ela já estava. Não há para onde levar alguém que acabou de terminar o que tinha para fazer.
       */}
      {comemorar ? (
        <SuccessOverlay
          title="Dia completo"
          description={`Todas as ${total} ${total === 1 ? "dose" : "doses"} de hoje estão registradas.`}
          onDone={() => setComemorar(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}
