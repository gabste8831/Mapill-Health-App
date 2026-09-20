import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { AppointmentOutcome } from "@/domain/entities/appointment";
import { useAppointmentList } from "@/hooks/use-appointment-list";
import { useAppointmentRegistration } from "@/hooks/use-appointment-registration";
import { usePatientProfile } from "@/hooks/use-patient-profile";
import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { compromissosAMostrarNaHome } from "@/domain/use-cases/compromissos-a-mostrar-na-home";
import { dataPorExtenso } from "@/shared/datas-por-extenso";
import { spacing, useEstilos } from "@/shared/theme";
import { useTodayDoses, type DiaDaSemana, type DoseDoDia } from "@/hooks/use-today-doses";
import { formatarQuantidade } from "@/shared/rotulos-de-medicamento";
import { BarraDeProgresso, CenteredLoader, Fab, Header, SuccessOverlay } from "@/ui";
import { CardAdesaoSemanal } from "@/telas/Inicio/componentes/CardAdesaoSemanal/CardAdesaoSemanal";
import { CardCompromissoProximo } from "@/telas/Inicio/componentes/CardCompromissoProximo/CardCompromissoProximo";
import { ListaDeDosesRegistradas } from "@/telas/Inicio/componentes/ListaDeDosesRegistradas/ListaDeDosesRegistradas";
import { CardCompromissos } from "@/telas/Inicio/componentes/CardCompromissos/CardCompromissos";
import { AvisoDePermissoes } from "@/ui/AvisoDePermissoes/AvisoDePermissoes";
import { PainelDePermissoes } from "@/ui/PainelDePermissoes/PainelDePermissoes";
import { CardEstoque } from "@/ui/CardDeAtalho/CardEstoque";
import { CardEstoqueBaixo } from "@/telas/Inicio/componentes/CardEstoqueBaixo/CardEstoqueBaixo";
import { CardProximaDose } from "@/telas/Inicio/componentes/CardProximaDose/CardProximaDose";
import { ItemDeDose } from "@/telas/Inicio/componentes/ItemDeDose/ItemDeDose";
import { criarEstilos } from "./InicioScreen.styles";
import { mensagemParaAPessoa } from "@/shared/mensagem-de-erro";

/**
 * Quantas doses o diálogo do lote nomeia antes de resumir o resto. Além disso o texto vira uma
 * parede que ninguém lê - e um alerta que não é lido deixa de prevenir o erro que ele existe pra
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
 * O deslocamento é pequeno de propósito - a lista chega de baixo o suficiente para o olho seguir a
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

/** "1 comprimido · Com bastante água" - a dose, e a orientação quando existe. */
function descricaoDaDose(dose: DoseDoDia): string {
  const quantidade = formatarQuantidade(dose.amount, dose.doseUnit);
  return dose.intakeNote ? `${quantidade} · ${dose.intakeNote}` : quantidade;
}

/**
 * A frase do gráfico semanal. Média só dos dias que tiveram dose - incluir os dias vazios como
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
  // O carregamento e o erro ficam de fora: aquele é coberto pelo da agenda, e um erro de
  // compromisso não pode esconder as doses do dia - a seção simplesmente não aparece. `reload` vem
  // junto porque responder "fui" precisa reler a lista para o cartão refletir a resposta.
  const { items: compromissos, reload: recarregarCompromissos } = useAppointmentList();
  const { registrarDesfecho } = useAppointmentRegistration();
  // A Home nao pede permissao: ela avisa e leva a ajuda de alertas. O dialogo e pedido na folha de
  // lembrete, no instante em que a pessoa escolhe ser avisada.
  const permissoesDoAlarme = usePermissoesDeAlarme();

  const hoje = new Date();
  const nome = primeiroNome(draft?.fullName ?? "");
  const total = agenda.doses.length;
  const progresso = total === 0 ? 0 : agenda.resolvidas / total;

  const semMovimento = useReducedMotion();

  /**
   * A cascata de entrada roda uma vez, na primeira montagem, e nunca mais.
   *
   * `entering` comeca com o no invisivel. Um re-render no meio da animacao o deixa preso em
   * opacidade zero, e o cartao fica em branco: sombra e tamanho certos, conteudo nenhum. Trocar o
   * esquema de cores provoca isso, porque recria o tema inteiro e re-renderiza a Home de uma vez.
   *
   * Estado e nao `useRef`, porque o valor decide o que e renderizado, e ler `.current` no render e
   * o que a regra `react-hooks/refs` proibe.
   */
  const [podeAnimarEntrada, setPodeAnimarEntrada] = useState(true);
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setPodeAnimarEntrada(false));
    return () => cancelAnimationFrame(quadro);
  }, []);

  // Centralizado porque sao sete chamadas na tela, e uma que esquecesse a segunda condicao traria
  // o card em branco de volta so naquele bloco.
  function entradaDaLinha(indice: number) {
    if (semMovimento || !podeAnimarEntrada) return undefined;
    return entradaEscalonada(indice);
  }

  /**
   * O overlay do dia fechado celebra um marco, e nao cada dose: ele e de tela cheia e dura quase
   * tres segundos, e emenda-lo em cada confirmacao faria o gesto mais repetido do app virar o mais
   * demorado.
   *
   * A condicao e a transicao para o dia completo, e nao o estado: quem abre a Home as 22h com tudo
   * confirmado nao acabou de fazer nada, e receberia a comemoracao a cada `reload`.
   */
  const diaFechado = total > 0 && agenda.resolvidas === total;

  /**
   * `null` enquanto a agenda nao chegou, e e isso que separa "o dia fechou" de "a tela montou".
   *
   * Com `useState(diaFechado)` o valor inicial so vale na primeira montagem: voltando a Home,
   * `isLoading` ainda e verdadeiro, `diaFechado` nasce falso, e quando as doses chegam a comparacao
   * le isso como transicao. A comemoracao aparecia a cada redirecionamento com o dia completo.
   */
  const [diaFechadoAntes, setDiaFechadoAntes] = useState<boolean | null>(null);
  const [comemorar, setComemorar] = useState(false);

  /**
   * A comemoracao e de quem fechou o dia aqui, e nao de quem chega com ele ja fechado.
   *
   * A Home e uma aba e rele a agenda a cada foco. Sem esta marca, responder a ultima dose na tela
   * do alarme e voltar produzia uma transicao legitima aos olhos da comparacao, e a tela azul
   * piscava por cima do alarme que estava se fechando.
   */
  const chegouAgoraNaTela = useRef(true);
  useFocusEffect(
    useCallback(() => {
      chegouAgoraNaTela.current = true;
    }, []),
  );

  if (!isLoading && diaFechadoAntes !== diaFechado) {
    const primeiraLeitura = diaFechadoAntes === null;
    const noticiaDeFora = chegouAgoraNaTela.current;
    setDiaFechadoAntes(diaFechado);
    // Só a passagem para fechado comemora. O caminho de volta (uma correção retroativa reabre o
    // dia) apenas atualiza a memória, sem festejar o desfazer.
    if (diaFechado && !primeiraLeitura && !noticiaDeFora) setComemorar(true);
  }
  // Depois de a leitura do foco ser considerada, a tela volta a ser "ao vivo": daqui em diante as
  // mudanças vêm de quem está olhando para ela.
  if (!isLoading) chegouAgoraNaTela.current = false;
  const proximaDose = agenda.doses.find((dose) => dose.status === "next");
  const atrasadas = agenda.doses.filter((dose) => dose.status === "late");

  /**
   * O que ainda espera resposta vem antes do que ja foi registrado: em ordem cronologica pura,
   * quem confirmou as doses da manha via primeiro o que ja resolveu e precisava rolar para achar o
   * que falta.
   *
   * Dentro de cada grupo a ordem do horario se mantem. As atrasadas ficam de fora dos dois, porque
   * ja tem bloco proprio acima.
   */
  const pendentesDeHoje = agenda.doses.filter(
    (dose) => dose.status !== "late" && dose.status !== "confirmed" && dose.status !== "skipped",
  );
  const registradasDeHoje = agenda.doses.filter(
    (dose) => dose.status === "confirmed" || dose.status === "skipped",
  );

  /**
   * Os compromissos de hoje e os que ja entraram na janela do lembrete.
   *
   * A antecedencia do lembrete e a janela do card, entao os dois nunca discordam. A regra inteira,
   * com os casos de borda, mora em `compromissosAMostrarNaHome`.
   */
  const naHome = compromissosAMostrarNaHome({
    compromissos: compromissos.map((compromisso) => ({
      appointmentId: compromisso.id,
      scheduledFor: compromisso.scheduledFor,
      reminderLeadDays: compromisso.reminderLeadDays,
      reminderOnDay: compromisso.reminderOnDay,
      jaRespondido: compromisso.outcome !== null,
    })),
    agora: hoje,
  });

  const compromissoPorId = new Map(compromissos.map((compromisso) => [compromisso.id, compromisso]));
  /** Os aprovados pela regra, já com a entidade de volta e na ordem que ela definiu. */
  const compromissosVisiveis = naHome.flatMap((item) => {
    const compromisso = compromissoPorId.get(item.appointmentId);
    return compromisso ? [{ ...item, compromisso }] : [];
  });

  const compromissosDeHoje = compromissosVisiveis.filter((item) => item.ehHoje);
  const compromissosProximos = compromissosVisiveis.filter((item) => !item.ehHoje);

  /**
   * Quantos compromissos existem daqui para a frente, dentro da janela do lembrete ou fora dela.
   *
   * Conta pelo dia, e não pelo instante: uma consulta às 9h continua sendo compromisso de hoje às
   * 15h - ela pode ter acontecido, e ainda falta responder o desfecho.
   */
  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
  const compromissosAgendados = compromissos.filter(
    (compromisso) => compromisso.scheduledFor >= inicioDeHoje,
  ).length;

  /**
   * O painel de permissões aparece quando falta algo **e** existe tratamento esperando aviso.
   *
   * A segunda condição é o que impede o app de cobrar autorização de quem nunca pediu lembrete
   * nenhum - permissão que não muda nada na vida da pessoa é o tipo de aviso que ensina a ignorar
   * os próximos.
   */
  const cobrarPermissoes = permissoesDoAlarme.temPendencia && agenda.tratamentosComLembrete > 0;

  /**
   * Confirmar pede confirmação explícita: gravar ingestão é registro clínico, e um toque acidental
   * na lista viraria um dado errado no histórico - que é justamente o que o app existe pra manter
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
   * Confirmar as atrasadas de uma vez, para quem ficou longe do celular.
   *
   * So para as atrasadas: sao as unicas em que "tomei" descreve algo que de fato aconteceu, e
   * estender o lote as futuras faria do historico um registro de intencao.
   *
   * Lista nome por nome o que vai ser gravado: uma acao que escreve varios registros clinicos de um
   * toque precisa mostrar o que sao.
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
        mensagemParaAPessoa(cause),
      );
    }
  }

  /**
   * "Fui" e "Nao fui" gravam na hora, sem dialogo.
   *
   * Diferente de confirmar uma dose, onde o toque move estoque e entra no calculo de adesao. Aqui
   * nada disso acontece, e cobrar confirmacao por algo tao reversivel faria a pessoa parar de
   * responder. A nota vai `null` porque este cartao nao tem onde anotar.
   */
  async function responderCompromisso(id: string, outcome: AppointmentOutcome) {
    try {
      await registrarDesfecho(id, outcome, null);
      await recarregarCompromissos();
    } catch (cause) {
      Alert.alert(
        "Não foi possível registrar",
        mensagemParaAPessoa(cause),
      );
    }
  }

  if (isLoading) return <CenteredLoader />;

  /**
   * O estoque e desenhado em uma de duas posicoes, conforme haja alerta.
   *
   * Com algo acabando ele sobe para junto dos avisos, porque alerta pede acao e adesao e leitura.
   * Sem alerta volta ao fim, onde e consulta. A secao nao se parte entre as duas: "Gerenciar
   * estoque" e para onde se vai depois de ler "acaba em 3 dias".
   */
  const temAlertaDeEstoque = agenda.estoquesBaixos.length > 0;
  const secaoDeEstoque =
    agenda.estoquesControlados > 0 || agenda.estoquesBaixos.length > 0 ? (
      <View style={styles.doseList}>
        <Text style={styles.sectionLabel}>Estoque</Text>

        {agenda.estoquesBaixos.map(({ medication, inventory, daysRemaining, lastDay }) => (
          <CardEstoqueBaixo
            key={inventory.id}
            medicationName={medication.name}
            daysRemaining={daysRemaining}
            lastDay={lastDay}
            // Vai pro estoque, não pro cadastro: quem viu "acaba em 3 dias" quer repor, e repor
            // pelo formulário do remédio obrigaria a reeditar um tratamento que não mudou.
            onAbrirEstoque={() => router.push("/estoque")}
          />
        ))}

        {/* Acesso permanente, e não só quando algo está acabando: o ícone no topo da aba
            Medicações passou despercebido no teste em aparelho. Some quando não há estoque
            controlado - aí a tela do outro lado abriria vazia. */}
        {agenda.estoquesControlados > 0 ? (
          <CardEstoque onPress={() => router.push("/estoque")} />
        ) : null}
      </View>
    ) : null;

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
                <Text style={styles.progressLabel}>Progresso diário</Text>
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
            // So as verificaveis, e e isso que faz o painel poder desaparecer: as outras nunca
            // seriam marcadas como atendidas, e ele ficaria para sempre na Home. Elas vivem na
            // ajuda de alertas, onde o rodape desta tela leva.
            itens={permissoesDoAlarme.itens.filter((item) => item.verificavel)}
            vaiTocar={permissoesDoAlarme.vaiTocar}
            onAbrirDetalhes={() => router.push("/cadastro/ajuda-de-alertas")}
          />
        ) : null}

        {proximaDose ? (
          <CardProximaDose
            time={proximaDose.time}
            medicationName={proximaDose.medicationName}
            doseLabel={formatarQuantidade(proximaDose.amount, proximaDose.doseUnit)}
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
                  // O texto é curto e o alvo real precisa ser de dedo, não de letra - o público
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
                entering={entradaDaLinha(indice)}>
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
              {/* Com compromisso no dia, "não há nada hoje" seria falso - o bloco deles vem logo
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
                entering={entradaDaLinha(atrasadas.length + indice)}>
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
            {/* Lista compacta, e não os cartões das pendentes.

                O que já foi respondido é registro, não tarefa: serve para conferir ("já tomei o das
                8?"), e quem confere varre a coluna de horários em vez de ler cartão por cartão. Em
                cartões o efeito era perverso - quanto mais em dia a pessoa estivesse, mais cheia
                ficava a Home, e as doses pendentes iam sendo empurradas para longe pelas resolvidas.

                Mesma forma da agenda do Calendário, onde o enxugamento já tinha funcionado. */}
            <Animated.View
              entering={entradaDaLinha(atrasadas.length + pendentesDeHoje.length)}>
              <ListaDeDosesRegistradas
                doses={registradasDeHoje.map((dose) => ({
                  doseScheduleId: dose.doseScheduleId,
                  time: dose.time,
                  medicationName: dose.medicationName,
                  note: descricaoDaDose(dose),
                  tomada: dose.status === "confirmed",
                }))}
                onCorrigir={(doseScheduleId) => {
                  const dose = registradasDeHoje.find((d) => d.doseScheduleId === doseScheduleId);
                  if (dose !== undefined) corrigir(dose);
                }}
              />
            </Animated.View>
          </View>
        ) : null}

        {/* Os compromissos vêm **depois** das doses, e em bloco próprio.

            Depois porque a dose é o que o app cobra ação: ela tem horário curto, botões e um estado
            que vence. O compromisso é do dia inteiro do ponto de vista de quem o lê aqui - saber que
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
            {compromissosDeHoje.map(({ compromisso }, indice) => (
              <Animated.View
                key={compromisso.id}
                /**
                 * A cascata continua de onde a agenda parou: as três listas são blocos distintos,
                 * mas uma sequência só descendo a tela.
                 */
                entering={entradaDaLinha(
                  atrasadas.length +
                    pendentesDeHoje.length +
                    // As registradas entram como **um** bloco, não uma por uma.
                    (registradasDeHoje.length > 0 ? 1 : 0) +
                    indice,
                )}>
                {/* O **mesmo** card de "Se aproximando", com `emDias={0}`.
                    Eram dois desenhos para a mesma coisa na mesma tela, a um scroll de distância um
                    do outro. O card já tratava o caso de hoje (barra e bloco de data em verde), e
                    só o de hoje é que não o usava. */}
                <CardCompromissoProximo
                  quando={new Date(compromisso.scheduledFor)}
                  title={compromisso.title}
                  location={compromisso.location}
                  notes={compromisso.notes}
                  emDias={0}
                  outcome={compromisso.outcome}
                  // Comparado por instante, e não pelo dia: a consulta das 8h de hoje já aconteceu
                  // às 15h, e é justamente quando faz sentido perguntar se a pessoa foi.
                  jaAconteceu={new Date(compromisso.scheduledFor) <= hoje}
                  onResponder={(outcome) => void responderCompromisso(compromisso.id, outcome)}
                  onPress={() =>
                    router.push({
                      pathname: "/compromissos",
                      params: { detalhe: compromisso.id },
                    })
                  }
                />
              </Animated.View>
            ))}
          </View>
        ) : null}

        {/* O que se aproxima, em bloco separado do que é hoje.

            Junto com os de hoje, a consulta de daqui a cinco dias leria como coisa do dia e faria a
            pessoa se preparar hoje.

            Card, e não linha: aqui cabe o **preparo** ("jejum de 12h"), que é a única informação do
            compromisso que exige ação antecipada - e descobri-la só ao abrir o detalhe é descobrir
            tarde. A linha da agenda de hoje não tem onde colocá-lo. */}
        {compromissosProximos.length > 0 || compromissosAgendados > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>
              {compromissosProximos.length > 0 ? "Se aproximando" : "Compromissos"}
            </Text>
            {compromissosProximos.map(({ compromisso, emDias }, indice) => (
              <Animated.View
                key={compromisso.id}
                entering={entradaDaLinha(
                  atrasadas.length +
                    pendentesDeHoje.length +
                    (registradasDeHoje.length > 0 ? 1 : 0) +
                    compromissosDeHoje.length +
                    indice,
                )}>
                <CardCompromissoProximo
                  quando={new Date(compromisso.scheduledFor)}
                  title={compromisso.title}
                  location={compromisso.location}
                  notes={compromisso.notes}
                  emDias={emDias}
                  outcome={compromisso.outcome}
                  // Estes ainda não chegaram - não há o que responder, e a pergunta não aparece.
                  jaAconteceu={false}
                  // Direto ao detalhe daquele compromisso, e não à lista: quem tocou já escolheu
                  // qual, e reencontrá-lo lá dentro anularia o atalho.
                  onPress={() =>
                    router.push({
                      pathname: "/compromissos",
                      params: { detalhe: compromisso.id },
                    })
                  }
                />
              </Animated.View>
            ))}

            {/* A agenda inteira, para além do que já entrou na janela do lembrete - e **dentro** da
                mesma seção dos que se aproximam, porque respondem à mesma pergunta: "o que eu tenho
                marcado?". Solto no meio dos cards de estoque, ele obrigava a percorrer a tela para
                juntar duas coisas do mesmo assunto.

                Este responde "e a consulta de novembro, o app guardou?" - sem ele, a janela do
                lembrete, que é o que mantém a tela do dia enxuta, viraria a sensação de que o
                compromisso se perdeu. */}
            {compromissosAgendados > 0 ? (
              <CardCompromissos onPress={() => router.push("/compromissos")} />
            ) : null}
          </View>
        ) : null}

        {/* O estoque em alerta vem **antes** da adesão: ele pede uma ida à farmácia hoje, e o
            gráfico da semana é leitura que espera. Sem alerta esta linha não desenha nada, e a
            seção aparece no fim, onde sempre esteve. */}
        {temAlertaDeEstoque ? secaoDeEstoque : null}

        {/* Só com algum dia medido: um gráfico de sete traços vazios não informa nada. */}
        {agenda.semana.some((dia) => dia.ratio !== null) ? (
          <View style={styles.doseList}>
            {/* O rótulo nomeia o **escopo**, como "Se aproximando" e "Estoque" - é o que dá à Home
                uma leitura de índice, em que cada assunto se anuncia antes de aparecer. O título
                dentro do card segue descrevendo o gráfico, que é outra coisa. */}
            <Text style={styles.sectionLabel}>Minha adesão</Text>
            <CardAdesaoSemanal
              days={agenda.semana}
              summary={resumoDaSemana(agenda.semana)}
              onAbrirRelatorio={() => router.push("/adesao")}
            />
          </View>
        ) : null}

        {/* Aqui so quando nao ha alerta: com ele, a secao ja foi desenhada acima da adesao. */}
        {!temAlertaDeEstoque ? secaoDeEstoque : null}

        {/* No fim, e nao no topo: este aviso e permanente, porque as tres autorizacoes que ele
            cobre nao expoem estado a API nenhuma. Acima da agenda, tomaria para sempre o lugar do
            que a pessoa abriu o app para ver.

            So para quem pediu algum aviso: cobrar autorizacao de quem nao configurou lembrete
            ensina a ignorar os proximos. */}
        {agenda.tratamentosComLembrete > 0 ? (
          <View style={styles.doseList}>
            <Text style={styles.sectionLabel}>Autorizações do aparelho</Text>
            {/* Condicional e nao imperativa: tres das cinco autorizacoes o app nao verifica, entao
                esta secao nunca sabe se ha algo errado. "Se algum aviso nao chegou" so interpela
                quem esta com o problema; quem nao esta segue para a agenda. */}
            <Text style={styles.avisoDePermissoesTexto}>
              Se algum alarme ou notificação não chegou como devia, confira as autorizações do seu
              aparelho.
            </Text>
            <AvisoDePermissoes
              oQueNaoFunciona="seus alarmes e notificações"
              // A frase acima já diz a consequência: repeti-la aqui seria a mesma informação em
              // duas linhas seguidas.
              semDescricao
              // Vermelho exatamente quando o painel crítico está na tela: `cobrarPermissoes` é a
              // mesma condição, então os dois blocos nunca discordam sobre haver pendência.
              urgente={cobrarPermissoes}
              onAbrir={() => router.push("/cadastro/ajuda-de-alertas")}
            />
          </View>
        ) : null}
      </ScrollView>

      <Fab
        accessibilityLabel="Cadastrar medicação ou compromisso"
        onPress={() => router.push("/cadastro/escolha")}
      />

      {/* Fora do `ScrollView` e depois do `Fab`, para cobrir a tela inteira. `onDone` so desliga o
          estado, sem navegar: nao ha para onde levar quem acabou de terminar o que tinha a fazer. */}
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
