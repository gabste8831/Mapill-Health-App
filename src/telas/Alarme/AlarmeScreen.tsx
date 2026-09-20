import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Pressable, ScrollView, Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estaBloqueado, pedirDesbloqueio } from "@/modules/desbloqueio";
import { chaveDoHorario } from "@/domain/use-cases/planejar-avisos-de-dose";
import { useDosesDoAlarme } from "@/hooks/use-doses-do-alarme";
import { MINUTOS_DE_ADIAMENTO } from "@/notifications/acoes";
import { ouvirPedidoDeEncerrarAlarme } from "@/notifications/doses-resolvidas";
import { entrouEmCena, saiuDeCena } from "@/notifications/alarme-em-cena";
import { dispensarAlarmeAtivo, NotifeeGateway } from "@/notifications/notifee-gateway";
import { comecarASoar, pararDeSoar } from "@/notifications/som-do-alarme";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import { adiarAviso } from "@/notifications/responder-aviso";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { CenteredLoader, FotoLocal } from "@/ui";
import { criarEstilos } from "./AlarmeScreen.styles";

/**
 * A tela tem tres formas, e o numero de doses escolhe qual. O que muda entre elas e a escala, e
 * nao o conteudo.
 *
 * Uma dose e a tela cheia de sempre. Duas ou tres viram lista, com miniatura a esquerda: repetir o
 * bloco de uma dose tres vezes fazia da tela uma parede de texto. Acima disso nem lista, so os
 * nomes e o caminho para o app, porque ali a pessoa nao decide olhando o alarme.
 */
const MAXIMO_PARA_LISTAR = 3;

/**
 * Ate quantos remedios se responde pela propria tela do alarme.
 *
 * Um: a resposta em lote e o caminho menos usado e o que mais custou para manter de pe. O que fica
 * e o "Ver e confirmar no app", que leva a tela do horario, onde cada dose se resolve
 * individualmente.
 */
const MAXIMO_PARA_RESPONDER_NO_ALARME = 1;

/**
 * Quanto o alarme toca antes de silenciar sozinho.
 *
 * Ele nao para de existir: a tela continua aberta e a dose pendente, o que acaba e o barulho. Um
 * alarme indefinido num aparelho esquecido na mesa e tortura para quem esta por perto, e quem
 * precisa dele ja nao esta ali para ouvir.
 */
const SILENCIA_SOZINHO_EM_MS = 5 * 60_000;

type AlarmeScreenProps = {
  /** ISO do horário que disparou. Vem no `data` da notificação do Notifee. */
  instanteIso: string;
  /** Fecha a tela - no full-screen intent é `notifee.stopForegroundService`/finish da Activity. */
  onFechar: () => void;
  /**
   * `true` quando a tela é a **Activity própria** do full-screen intent, e não a rota dentro do app.
   *
   * Só a Activity encerra ao perder o primeiro plano: ela existe sozinha, então algo vir para a
   * frente significa que a pessoa saiu dela. Como rota, o app **é** o primeiro plano, e um
   * `inactive` passageiro (um heads-up por cima, a barra de notificações puxada) fecharia o alarme
   * sem ninguém ter saído.
   */
  ehActivityDeAlarme?: boolean;
};

/**
 * A tela do alarme: ocupa o aparelho inteiro, toca ate alguem responder, e sai so com uma resposta.
 *
 * Separada da tela de horario porque as duas nascem de situacoes opostas: aquela e consultada, esta
 * irrompe sobre o bloqueio, possivelmente de madrugada. Por isso nao ha cabecalho, voltar nem
 * navegacao, os alvos sao grandes, e silenciar e a primeira acao.
 *
 * O som nao mora aqui: quem toca e o foreground service, que sobe com a notificacao e independe de
 * tela, porque esta nem sempre monta. Esta tela pede o som ao montar e o para ao ser respondida,
 * mas nao o possui - fecha-la nao cala um alarme que ninguem respondeu.
 */
export function AlarmeScreen({
  instanteIso,
  onFechar,
  ehActivityDeAlarme = false,
}: AlarmeScreenProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const { doses, isLoading, registrar } = useDosesDoAlarme(instanteIso);
  const [silenciado, setSilenciado] = useState(false);

  /**
   * Anuncia que esta tela esta em cena, para nenhuma outra abrir para o mesmo horario.
   *
   * Na montagem, e nao em quem abre: e a montagem que prova que a tela existe. Quem abre pode
   * falhar no meio, e marcar antes deixaria a trava presa num alarme que nunca apareceu.
   */
  useEffect(() => {
    const por = ehActivityDeAlarme ? "activity" : "rota";
    entrouEmCena(instanteIso, por);
    return () => saiuDeCena(instanteIso, por);
  }, [instanteIso, ehActivityDeAlarme]);

  /**
   * A notificacao do horario sai da bandeja, mas so com a tela de fato visivel.
   *
   * A tela pergunta por si: como Activity do full-screen intent ela esta na frente por definicao;
   * como rota, so dispensa com o app `active`. Se montasse sem estar visivel, dispensar apagaria o
   * unico aviso visivel e deixaria o som sem rosto nem forma de parar.
   *
   * `dispensar(chave)` e nao `dispensarAlarmeAtivo()`: aquela varre todos os alarmes da bandeja, e
   * um de outro horario ainda sem resposta nao tem por que sumir porque esta tela abriu.
   */
  useEffect(() => {
    if (!ehActivityDeAlarme && AppState.currentState !== "active") return;
    void new NotifeeGateway().dispensar(chaveDoHorario(instanteIso));
  }, [instanteIso, ehActivityDeAlarme]);

  /**
   * O som, enquanto a dose nao for respondida.
   *
   * `comecarASoar` e idempotente e o servico ja costuma estar tocando quando esta tela monta: a
   * chamada serve para o caso em que ela abre sem o servico ter subido. Um player proprio aqui
   * seria uma segunda fonte de audio, e silenciar pela tela calaria so uma delas.
   *
   * A limpeza nao para o som de proposito: com o celular em uso a tela nem monta, e parar na
   * desmontagem faria a tela fechada calar um alarme que ninguem respondeu. Quem para e
   * `dispensarAlarmeAtivo`.
   */
  useEffect(() => {
    if (silenciado) return;
    comecarASoar();
  }, [silenciado]);

  // Independente do som, e e isso que a torna util: volume baixo, audio falhando ou aparelho no
  // bolso, a vibracao ainda avisa. Padrao longo, porque o curto se confunde com mensagem.
  useEffect(() => {
    if (silenciado) return;
    Vibration.vibrate([0, 600, 400, 600, 1200], true);
    return () => Vibration.cancel();
  }, [silenciado]);

  // Para o servico junto, pelo mesmo motivo do botao: marcar o estado sem para-lo deixaria o alarme
  // tocando para sempre num aparelho que ninguem atendeu.
  useEffect(() => {
    if (silenciado) return;
    const timer = setTimeout(() => {
      pararDeSoar();
      setSilenciado(true);
    }, SILENCIA_SOZINHO_EM_MS);
    return () => clearTimeout(timer);
  }, [silenciado]);

  // Para o servico, e nao so marca o estado desta tela: o som nao pertence a ela, e sem esta
  // chamada o botao mudaria a tela e o alarme seguiria tocando.
  const silenciar = useCallback(() => {
    pararDeSoar();
    setSilenciado(true);
  }, []);

  /**
   * Responder encerra o alarme inteiro: para o som, tira a notificação da bandeja e fecha a tela.
   *
   * A ordem importa. O som para primeiro porque é o que incomoda; a notificação sai em seguida
   * porque, deixada ali, ela reabriria esta tela ao ser tocada; e a tela fecha por último, quando
   * não há mais nada pendente atrás dela.
   */
  const encerrar = useCallback(async () => {
    setSilenciado(true);
    await dispensarAlarmeAtivo();
    onFechar();
  }, [onFechar]);

  const responderTodas = useCallback(
    async (status: "confirmed" | "skipped") => {
      for (const dose of doses) {
        if (dose.resolvida) continue;
        await registrar(dose, status);
      }

      /**
       * Fecha antes de reagendar, e a ordem e o que evita o lampejo azul.
       *
       * O reagendamento cancela tudo e reconstroi, e a dose recem-respondida ainda cai na
       * tolerancia de 2 minutos: o aviso volta a ser agendado, dispara quase na hora, e o
       * `DELIVERED` reabria esta tela. Fechando antes, ela ja saiu quando o eco chega. O listener
       * tambem o ignora, e as duas defesas sao de camadas diferentes.
       */
      await encerrar();
      void reagendarTodosOsAvisos();
    },
    [doses, registrar, encerrar],
  );

  /**
   * Leva a tela do horario dentro do app, onde cada dose se resolve individualmente.
   *
   * Por deep link, e nao pelo roteador: esta tela roda numa Activity propria, fora do `expo-router`,
   * e nao ha navegador a que pedir um `push`.
   *
   * Com o aparelho bloqueado, exige o desbloqueio: responder a dose daqui segue sem senha, porque e
   * para isso que o alarme existe, mas entrar no app da acesso a medicamentos, historico e ficha de
   * saude. O pedido vem antes de silenciar e dispensar, senao quem cancela a senha receberia o
   * alarme desligado, que e parte do que o cancelamento recusou.
   */
  const abrirNoApp = useCallback(async () => {
    // `!== false`: na duvida, pede. O `null` e "nao consegui perguntar", e aqui ele pesa para o
    // lado oposto do que pesa no alarme, onde a duvida so mostra a tela.
    if ((await estaBloqueado()) !== false && !(await pedirDesbloqueio())) return;

    setSilenciado(true);
    await dispensarAlarmeAtivo();
    await Linking.openURL(`mapillapp://horario/${encodeURIComponent(instanteIso)}`).catch(() => {});
    onFechar();
  }, [instanteIso, onFechar]);

  const adiar = useCallback(async () => {
    setSilenciado(true);
    await adiarAviso(doses.filter((dose) => !dose.resolvida).map((dose) => dose.doseScheduleId));
    await dispensarAlarmeAtivo();
    onFechar();
  }, [doses, onFechar]);

  // Escolher outro caminho para responder e uma resposta ao alarme: seguir tocando enquanto a
  // pessoa decide na outra tela e cobrar algo que ela ja foi atender.
  useEffect(() => ouvirPedidoDeEncerrarAlarme(onFechar), [onFechar]);

  /**
   * Perder o primeiro plano encerra o alarme, e e esta a garantia que funciona.
   *
   * O aviso interno acima nao alcanca esta tela quando o toque e processado pelo
   * `onBackgroundEvent`: aquele handler roda num contexto JS separado, e o `Set` de ouvintes vive
   * na memoria de cada contexto. O `AppState` nao depende de contexto compartilhado, e vale para
   * qualquer saida. A dose segue pendente: sair nao e responder.
   */
  useEffect(() => {
    /**
     * So para a Activity de tela cheia, e nao para esta tela aberta como rota.
     *
     * Como rota, o app e o primeiro plano, e um `inactive` passageiro (o heads-up que sobe, a barra
     * puxada) fecharia o alarme sem ninguem ter saido dele.
     */
    if (!ehActivityDeAlarme) return;

    // So encerra depois de ter estado ativo uma vez: a Activity nasce enquanto o aparelho ainda
    // desbloqueia, e fechar nesse intervalo mataria o alarme antes de alguem ve-lo.
    let esteveAtivo = AppState.currentState === "active";

    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        esteveAtivo = true;
        return;
      }
      if (!esteveAtivo) return;
      void dispensarAlarmeAtivo().then(onFechar);
    });
    return () => assinatura.remove();
  }, [ehActivityDeAlarme, onFechar]);

  /**
   * A dose respondida em outro lugar tambem encerra este alarme.
   *
   * A lista revalida a cada poucos segundos, entao confirmar pelo botao da notificacao a esvazia
   * sozinha. Sem isto a tela seguia tocando e oferecendo "Tomei" para uma dose ja registrada.
   *
   * `isLoading` impede o fechamento no primeiro quadro, antes de a lista chegar.
   */
  useEffect(() => {
    if (isLoading) return;
    if (doses.length === 0) return;
    if (doses.some((dose) => !dose.resolvida)) return;

    // Sem passar pelo `encerrar`, que chama `setSilenciado`: escrever estado num efeito e o que a
    // regra `set-state-in-effect` proibe. O som para no `dispensarAlarmeAtivo`.
    void dispensarAlarmeAtivo().then(onFechar);
  }, [doses, isLoading, onFechar]);

  /**
   * Quantos remedios a tela desenha, decidido uma vez e mantido.
   *
   * O numero de pendentes cai enquanto a tela esta aberta, e com a forma derivada direto dele o
   * rodape inteiro se reorganizava debaixo do dedo de quem estava prestes a tocar. Congelar so a
   * forma resolve sem mentir: a lista mostra as doses de verdade, o layout e que nao muda.
   *
   * `useState` e nao `useRef` porque ler ref durante o render e o que a regra `react-hooks/refs`
   * proibe.
   */
  const [formaCongelada, setFormaCongelada] = useState<number | null>(null);

  if (isLoading) return <CenteredLoader />;

  const pendentes = doses.filter((dose) => !dose.resolvida);

  /**
   * Congela na primeira renderização com a lista já carregada.
   *
   * Escrito durante o render, e não num efeito: é o padrão de estado derivado que o React documenta
   * (*"adjusting state when props change"*), e é o que a regra `set-state-in-effect` empurra para
   * cá. O `if` garante uma escrita só - a partir daí a condição é falsa e o render é puro.
   */
  if (formaCongelada === null) setFormaCongelada(pendentes.length);

  const quantosDesenhar = formaCongelada ?? pendentes.length;
  const umaSo = quantosDesenhar === 1;
  /**
   * Com mais de uma dose o alarme lista e nao responde: confirmar passa a exigir o app.
   *
   * Marcar "tomei todas" no escuro e recem-acordado e assinar varios registros clinicos com um
   * toque so, sem ter olhado nenhum. O custo recai sobre o paciente polimedicado, que e quem mais
   * se beneficiaria do botao direto; o "Ver e confirmar no app" e o que torna isso aceitavel.
   */
  const podeResponderAqui = quantosDesenhar <= MAXIMO_PARA_RESPONDER_NO_ALARME;
  // Detalhada contra enxuta e decidido por `umaSo`, e nao por uma terceira variavel: e a mesma
  // pergunta que ja governa o titulo e os botoes.
  const listar = quantosDesenhar <= MAXIMO_PARA_LISTAR;
  // Um adiamento por horário: basta uma dose já ter gasto o dela para o botão não ter mais efeito.
  const podeAdiar = pendentes.length > 0 && pendentes.every((dose) => dose.snoozeCount === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* So os remedios rolam: o cabecalho fica no topo e as acoes fixas no rodape, porque nenhum
          dos dois pode depender de rolar. Sem rolagem, o segundo cartao empurrava "Responder
          depois" para fora da tela, e ficar sem saida visivel aqui e o pior defeito possivel. */}
      <View style={styles.cabecalho}>
        {/* A contagem entra quando ha mais de um: diz, antes de qualquer nome, quantas respostas
            este horario espera. */}
        <Text style={styles.titulo}>
          {umaSo ? "Hora do seu remédio" : `Hora dos seus ${pendentes.length} remédios`}
        </Text>
        <Text style={styles.hora}>
          {new Date(instanteIso).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        {/* Acima do limite, so nome e dose numa linha por remedio: sem foto, orientacao ou local.
            "Voce tem 4 remedios" sem os nomes nao e informacao, e um aviso de que a informacao esta
            em outro lugar - e o nome e o que responde "e o da pressao ou o do sono?", pergunta que
            se faz antes de decidir se levanta agora. */}
        {!listar ? (
          <View style={styles.listaMinima}>
            {pendentes.map((dose) => (
              <View key={dose.doseScheduleId} style={styles.itemMinimo}>
                <Text style={styles.nomeMinimo} numberOfLines={1}>
                  {dose.medicationName}
                </Text>
                <Text style={styles.quantidadeMinima} numberOfLines={1}>
                  {dose.quantidadeFormatada}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.lista}>
          {(listar ? pendentes : []).map((dose) => {
            // Sem isto a faixa de detalhes era desenhada vazia e o `gap` abria um vao embaixo do
            // nome. Remedio sem orientacao, observacao e local e o caso comum de quem cadastra
            // apressado, e nao pode parecer cartao quebrado.
            const temDetalhes =
              dose.orientacoes.length > 0 ||
              (dose.intakeNote !== null && dose.intakeNote.length > 0) ||
              (dose.notes !== null && dose.notes.length > 0) ||
              (dose.storageLocation !== null && dose.storageLocation.length > 0);

            return (
            <View key={dose.doseScheduleId} style={umaSo ? styles.item : styles.itemEnxuto}>
              {/**
               * A foto da caixa, quando existe.
               *
               * Reconhecer a embalagem é mais rápido que ler o nome - e às 6 da manhã, sem óculos,
               * é às vezes a única coisa que se lê de verdade. Para quem toma cinco remédios de
               * nomes parecidos, é o que separa a caixa certa da errada.
               *
               * **Só quando existe.** Sem foto, nada ocupa o lugar: esta é a tela que menos pode
               * ter ruído, e um quadrado cinza vazio de madrugada não ajuda ninguém.
               */}
              {/* `contain` e não o `cover` padrão: aqui a foto é para ser **lida**, e cortar a
                  borda pode cortar a dosagem impressa no canto da caixa. É a mesma razão do
                  visualizador da receita. */}
              {umaSo ? (
                <>
                  {dose.photoUri !== null ? (
                    <FotoLocal uri={dose.photoUri} style={styles.foto} contentFit="contain" />
                  ) : null}
                  <Text style={styles.nome}>{dose.medicationName}</Text>
                  <Text style={styles.quantidade}>{dose.quantidadeFormatada}</Text>
                </>
              ) : (
                /**
                 * Duas faixas, e nao duas colunas.
                 *
                 * Em cima a foto ao lado do nome e da dose, que e o par que identifica o remedio;
                 * embaixo o texto da tomada, na largura inteira. Presas a uma coluna ao lado da
                 * foto, as linhas de texto quebravam cedo e o cartao crescia, e com tres remedios o
                 * terceiro so aparecia rolando.
                 *
                 * A miniatura fica porque reconhecer a caixa vale ainda mais quando ha varias a
                 * distinguir; o que nao cabe e o tamanho cheio.
                 */
                <View style={styles.itemEmFaixas}>
                  <View style={styles.identificacao}>
                    {dose.photoUri !== null ? (
                      <FotoLocal uri={dose.photoUri} style={styles.miniatura} contentFit="cover" />
                    ) : null}
                    <View style={styles.nomeEDose}>
                      <Text style={styles.nomeCompacto}>{dose.medicationName}</Text>
                      <Text style={styles.quantidadeCompacta}>{dose.quantidadeFormatada}</Text>
                    </View>
                  </View>

                  {/* Nada e omitido aqui: o que muda e o corpo, nao o conteudo. Quem toma em jejum
                      precisa saber no instante em que levanta, nao depois de ter comido. Caber e
                      problema de tamanho, e se resolve reduzindo a escala. */}
                  {temDetalhes ? (
                  <View style={styles.detalhesDoItem}>
                    {/* As orientacoes do cadastro vem antes do texto livre porque sao a regra
                        fechada. O fundo proprio as separa da observacao, que e anotacao de quem
                        cuida e nao instrucao da dose. */}
                    {dose.orientacoes.length > 0 ? (
                      <View style={styles.etiquetas}>
                        {dose.orientacoes.map((orientacao) => (
                          <View key={orientacao} style={styles.etiqueta}>
                            <Text style={styles.textoDaEtiqueta}>{orientacao}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
                      <Text style={styles.orientacaoCompacta}>{dose.intakeNote}</Text>
                    ) : null}
                    {dose.notes !== null && dose.notes.length > 0 ? (
                      <Text style={styles.observacaoCompacta}>{dose.notes}</Text>
                    ) : null}
                    {dose.storageLocation !== null && dose.storageLocation.length > 0 ? (
                      <View style={styles.localEnxuto}>
                        <Ionicons name="location-outline" size={15} color={cores.onPrimary} />
                        <Text style={styles.localCompacto}>{dose.storageLocation}</Text>
                      </View>
                    ) : null}
                  </View>
                  ) : null}
                </View>
              )}
              {/* O que a pessoa precisa saber antes de engolir. "Esse era em jejum?" e pergunta
                  que se faz no instante do alarme, nao depois. */}
              {umaSo && dose.orientacoes.length > 0 ? (
                <View style={[styles.etiquetas, styles.etiquetasCentradas]}>
                  {dose.orientacoes.map((orientacao) => (
                    <View key={orientacao} style={styles.etiqueta}>
                      <Text style={styles.textoDaEtiqueta}>{orientacao}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {umaSo && dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
                <Text style={styles.orientacao}>{dose.intakeNote}</Text>
              ) : null}
              {umaSo && dose.notes !== null && dose.notes.length > 0 ? (
                <Text style={styles.observacao}>{dose.notes}</Text>
              ) : null}
              {/* Pequeno e por ultimo: nao e o que se le primeiro, mas e o que faz a pessoa sair do
                  lugar. O icone evita confundi-lo com a orientacao acima, que tambem e texto miudo
                  em cinza. */}
              {umaSo && dose.storageLocation !== null && dose.storageLocation.length > 0 ? (
                <View style={styles.local}>
                  <Ionicons name="location-outline" size={14} color={cores.onPrimary} />
                  <Text style={styles.localTexto}>{dose.storageLocation}</Text>
                </View>
              ) : null}
            </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.acoes}>
          {/* Com mais de uma dose, a confirmação vai para o app.

              O botão é o primeiro da tela, e não uma saída escondida: quando ele substitui os
              botões de responder, ele **é** o caminho principal e precisa parecer isso. Abre a
              tela do horário, onde cada dose se resolve individualmente. */}
          {!podeResponderAqui ? (
            <Pressable
              style={estadoDePressao(styles.botaoTomei, { escala: true })}
              onPress={() => void abrirNoApp()}
              accessibilityRole="button"
              accessibilityLabel={`Abrir o aplicativo para conferir e confirmar as ${pendentes.length} doses`}>
              <Ionicons name="open-outline" size={20} color={cores.primary} />
              <Text style={styles.textoTomei}>Ver e confirmar no app</Text>
            </Pressable>
          ) : null}

          {/* As duas respostas na mesma linha, dividindo a largura - e com ícone, porque quem
              acabou de acordar reconhece o ✓ e o ✗ antes de terminar de ler a palavra. É o mesmo
              par de "Confirmar"/"Pular" da agenda, no tamanho que esta tela pede. */}
          {podeResponderAqui ? (
          <View style={styles.linhaDeResposta}>
            <Pressable
              style={estadoDePressao(styles.botaoPulei, { escala: true })}
              onPress={() => void responderTodas("skipped")}
              accessibilityRole="button"
              accessibilityLabel="Pulei esta dose">
              <Ionicons name="close" size={20} color={cores.onPrimary} />
              <Text style={styles.textoPulei}>Pulei</Text>
            </Pressable>
            <Pressable
              style={estadoDePressao(styles.botaoTomei, { escala: true })}
              onPress={() => void responderTodas("confirmed")}
              accessibilityRole="button"
              accessibilityLabel="Tomei esta dose">
              <Ionicons name="checkmark" size={20} color={cores.primary} />
              <Text style={styles.textoTomei}>Tomei</Text>
            </Pressable>
          </View>
          ) : null}

          {/* Silenciar e Adiar dividem a linha: nenhum dos dois registra desfecho, e o espaco
              economizado vai para a foto.

              O botao de silenciar fica na linha do comeco ao fim, mudando de estado e nao de
              presenca: tirando-o, o Adiar esticava e tudo descia alguns dp, reorganizando o rodape
              debaixo do dedo de quem acabou de tocar. O Adiar e que pode faltar, quando o horario
              ja gastou seu adiamento - e isso e decidido antes de a tela abrir. */}
          <View style={styles.linhaDeSaidas}>
              <Pressable
                style={
                  silenciado
                    ? [styles.botaoSilenciar, styles.botaoInativo]
                    : estadoDePressao(styles.botaoSilenciar)
                }
                onPress={silenciado ? undefined : silenciar}
                disabled={silenciado}
                accessibilityRole="button"
                accessibilityState={{ disabled: silenciado }}
                accessibilityLabel={
                  silenciado ? "O som já está desligado" : "Desligar o som do alarme"
                }>
                <Ionicons
                  name={silenciado ? "volume-off" : "volume-mute"}
                  size={18}
                  color={cores.onPrimary}
                />
                <Text style={styles.textoSilenciar}>
                  {silenciado ? "Sem som" : "Silenciar"}
                </Text>
              </Pressable>

              {/* Adiar promete volta; "Responder depois" só fecha. As duas saídas existem porque
                  são coisas diferentes: quem vai buscar o remédio agora quer ser lembrado em
                  minutos, e quem já sabe que vai resolver mais tarde não quer o alarme de novo
                  daqui a pouco. */}
              {podeAdiar ? (
                <Pressable
                  style={estadoDePressao(styles.botaoSilenciar)}
                  onPress={() => void adiar()}
                  accessibilityRole="button"
                  accessibilityLabel={`Adiar o alarme em ${MINUTOS_DE_ADIAMENTO} minutos`}>
                  <Ionicons name="time-outline" size={18} color={cores.onPrimary} />
                  <Text style={styles.textoSilenciar}>Adiar {MINUTOS_DE_ADIAMENTO} min</Text>
                </Pressable>
              ) : null}
            </View>

          {/* Sair sem responder é legítimo - a pessoa pode querer conferir a caixa antes. A dose
              continua pendente e reaparece na Home, como qualquer atrasada. */}
          <Pressable
            style={estadoDePressao(styles.botaoDepois)}
            onPress={() => void encerrar()}
            accessibilityRole="button"
            accessibilityLabel="Responder depois, sem registrar agora">
            <Text style={styles.textoDepois}>Responder depois</Text>
          </Pressable>
      </View>
    </SafeAreaView>
  );
}
