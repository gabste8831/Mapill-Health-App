import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Pressable, ScrollView, Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { chaveDoHorario } from "@/domain/use-cases/planejar-avisos-de-dose";
import { useDosesDoAlarme } from "@/hooks/use-doses-do-alarme";
import { MINUTOS_DE_ADIAMENTO } from "@/notifications/acoes";
import { ouvirPedidoDeEncerrarAlarme } from "@/notifications/doses-resolvidas";
import { entrouEmCena, saiuDeCena } from "@/notifications/alarme-em-cena";
import { dispensarAlarmeAtivo, NotifeeGateway } from "@/notifications/notifee-gateway";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import { adiarAviso } from "@/notifications/responder-aviso";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { CenteredLoader, FotoLocal } from "@/ui";
import { criarEstilos } from "./AlarmeScreen.styles";

const SOM_DO_ALARME = require("../../../assets/sounds/alarme_de_dose.wav");

/**
 * A tela tem **três formas**, e o número de doses escolhe qual.
 *
 * A de uma dose é a que o alarme foi desenhado para ser: foto grande, nome em corpo 30, tudo o que
 * ajuda a reconhecer a caixa sem óculos e recém-acordado. Ela funciona, e não muda.
 *
 * O problema aparecia ao repetir esse bloco. Com três remédios eram três fotos de 132dp, três nomes
 * em corpo 30, três quantidades e três orientações empilhadas — cada um desenhado como se fosse o
 * único. Visto em aparelho em 12/09: a tela vira uma parede de texto, e uma lista que não se lê como
 * lista é pior que nenhuma.
 *
 * Então:
 *
 * - **1 dose** — a tela cheia de sempre, com foto de 132dp e nome em corpo 30.
 * - **2 ou 3** — uma lista: miniatura de 44dp à esquerda, e à direita nome, quantidade, orientação
 *   de tomada e onde a caixa está. **Nada é omitido** — o que muda é a escala. A foto fica porque
 *   distinguir uma caixa da outra importa mais aqui do que na tela de uma dose só.
 * - **4 ou mais** — nem lista. Só quantos remédios são, e o caminho para o app. Acima de três, a
 *   pessoa não decide olhando a tela do alarme: ela vai conferir onde cada dose se resolve.
 */
const MAXIMO_PARA_LISTAR = 3;

/**
 * Até quantos remédios se responde pela própria tela do alarme. Ver `podeResponderAqui`.
 *
 * **Um, desde 09/09** — antes eram três, com os botões "Tomei todas" e "Pulei todas".
 *
 * Decisão do Gabriel, tomada depois de uma sessão inteira caçando um defeito que aparecia
 * justamente ali: o alarme com mais de um remédio mostrava duas telas e o som saía duplicado. A
 * causa era outra (ver `alarme-em-cena`) e está corrigida, mas a resposta em lote deixou de valer o
 * risco — ela é o caminho menos usado do alarme e o que mais custou para manter de pé.
 *
 * O que se perde é o atalho de quem toma vários remédios no mesmo horário. O que fica é o
 * `Ver e confirmar no app`, que já existia e já era a saída para quatro ou mais: leva à tela do
 * horário, onde cada dose se resolve individualmente. Nenhum caminho desapareceu — o que mudou é
 * que ele passou a ser o único quando há mais de uma dose.
 *
 * A tela cheia continua inteira: ela irrompe, toca em loop, mostra a foto e silencia. Só a resposta
 * em lote saiu.
 */
const MAXIMO_PARA_RESPONDER_NO_ALARME = 1;

/**
 * Quanto tempo o alarme toca antes de silenciar sozinho.
 *
 * Ele **não** para de existir aos cinco minutos: a tela continua aberta e a dose continua pendente.
 * O que acaba é o barulho. Um alarme que toca indefinidamente num aparelho esquecido em cima da mesa
 * vira uma tortura para quem está por perto — e a pessoa que precisa dele já não está ali para
 * ouvir.
 */
const SILENCIA_SOZINHO_EM_MS = 5 * 60_000;

type AlarmeScreenProps = {
  /** ISO do horário que disparou. Vem no `data` da notificação do Notifee. */
  instanteIso: string;
  /** Fecha a tela — no full-screen intent é `notifee.stopForegroundService`/finish da Activity. */
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
 * A tela do alarme: ocupa o aparelho inteiro, toca até alguém responder, e sai só com uma resposta.
 *
 * ## Por que ela existe separada da tela de horário
 *
 * As duas mostram as mesmas doses e oferecem as mesmas ações, mas nascem de situações opostas. A
 * `HorarioScreen` é consultada — a pessoa foi até lá. Esta **irrompe**: aparece por cima da tela de
 * bloqueio, com o aparelho no bolso, possivelmente no meio da noite.
 *
 * Isso muda tudo o que importa. Aqui não há cabeçalho, não há voltar, não há navegação — sair
 * exige responder. Os alvos são grandes porque a pessoa acabou de acordar. E o silenciar é a
 * primeira ação, separada das outras, porque parar o barulho é o que ela quer fazer **antes** de
 * conseguir pensar em qualquer outra coisa.
 *
 * ## O som mora aqui, e não na notificação
 *
 * Notificação nenhuma toca em loop — o Android toca uma vez e para, em qualquer biblioteca. O que
 * faz este alarme ser um alarme é esta tela tocar o áudio em `loop` enquanto estiver aberta. A
 * notificação de tela cheia só a traz até aqui.
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
   * Anuncia que esta tela está em cena, para **nenhuma outra** abrir para o mesmo horário.
   *
   * Os dois pontos de entrada da tela vivem no mesmo processo JS (ver `alarme-em-cena`), e sem este
   * registro o alarme que irrompe com o app aberto produzia duas telas: a Activity do
   * `fullScreenAction` e a rota empurrada pelo listener. Duas telas, **dois players de áudio** — o
   * som duplicado relatado em aparelho em 09/09.
   *
   * Na montagem, e não em quem abre: é a montagem que prova que a tela existe. Quem abre pode
   * falhar no meio, e marcar antes deixaria a trava presa num alarme que nunca apareceu.
   */
  useEffect(() => {
    const por = ehActivityDeAlarme ? "activity" : "rota";
    entrouEmCena(instanteIso, por);
    return () => saiuDeCena(instanteIso, por);
  }, [instanteIso, ehActivityDeAlarme]);

  /**
   * **Esta tela existe só na frente da pessoa** — então a notificação do horário dela pode sair.
   *
   * As duas fontes de áudio (o `loopSound` do canal e o `createAudioPlayer` abaixo) tocam o mesmo
   * arquivo e se sobrepõem enquanto coexistem: o som duplicado de 10/09. Aqui a notificação sai sem
   * ressalva porque quem garante a condição é quem abre a tela, não ela mesma — com o app em
   * segundo plano a tela **não é mais montada** (ver `use-dose-notifications`), justamente para não
   * haver tela invisível apagando o único aviso visível.
   *
   * `dispensar(chave)` e não `dispensarAlarmeAtivo()`: aquela varre todos os alarmes da bandeja, e
   * um alarme de outro horário ainda sem resposta não tem por que sumir porque esta tela abriu — foi
   * o excesso revertido em 83135de.
   */
  useEffect(() => {
    void new NotifeeGateway().dispensar(chaveDoHorario(instanteIso));
  }, [instanteIso]);

  /**
   * Toca em loop até ser silenciado.
   *
   * O player é criado **dentro do efeito**, com `createAudioPlayer`, e não pelo `useAudioPlayer`.
   * O hook devolve um objeto que o React Compiler trata como imutável, e ligar o loop exige
   * atribuir `player.loop` — o que ele recusa, com razão: mutar valor de hook é justamente o que
   * quebra a memoização dele.
   *
   * Aqui o player é nosso, criado e destruído por este efeito. A limpeza faz as duas coisas: para
   * o som e libera o recurso nativo, inclusive quando a tela sai por um caminho que não passa pelos
   * botões — o sistema matando a Activity, por exemplo. Alarme que continua tocando depois da tela
   * fechada é o tipo de defeito que faz desinstalar o app.
   */
  useEffect(() => {
    if (silenciado) return;

    const player = createAudioPlayer(SOM_DO_ALARME);
    player.loop = true;
    player.play();

    /**
     * Rede de segurança do loop: se o áudio parar mesmo com `loop` ligado, isto o traz de volta.
     *
     * `loop` é o mecanismo principal e funciona. Mas ele é resolvido do lado nativo, e um alarme de
     * medicação não pode depender de uma única garantia: se o sistema pausar o player por qualquer
     * razão — foco de áudio disputado com outro app, por exemplo —, o alarme emudece sem sinal
     * nenhum, e a pessoa continua dormindo.
     *
     * O intervalo é maior que o arquivo (4,1 s), então em operação normal ele nunca faz nada: só
     * observa que o som está tocando e volta a dormir.
     */
    const vigia = setInterval(() => {
      if (!player.playing) player.play();
    }, 6_000);

    return () => {
      clearInterval(vigia);
      player.pause();
      player.release();
    };
  }, [silenciado]);

  /**
   * Vibra em ciclo enquanto o alarme está tocando.
   *
   * Independente do som, e é isso que a torna útil: se o volume estiver baixo, se o áudio falhar,
   * ou se o aparelho estiver no bolso, a vibração é o que ainda avisa. O padrão longo é o mesmo do
   * canal — vibração curta se confunde com mensagem, e a diferença entre "chegou um WhatsApp" e
   * "está na hora do remédio" precisa ser sentida sem olhar a tela.
   */
  useEffect(() => {
    if (silenciado) return;
    Vibration.vibrate([0, 600, 400, 600, 1200], true);
    return () => Vibration.cancel();
  }, [silenciado]);

  /** Silencia sozinho depois de um tempo — ver `SILENCIA_SOZINHO_EM_MS`. */
  useEffect(() => {
    if (silenciado) return;
    const timer = setTimeout(() => setSilenciado(true), SILENCIA_SOZINHO_EM_MS);
    return () => clearTimeout(timer);
  }, [silenciado]);

  const silenciar = useCallback(() => setSilenciado(true), []);

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
       * **Fecha antes de reagendar**, e a ordem é o que evita o lampejo azul.
       *
       * `reagendarTodosOsAvisos` cancela tudo e reagenda a partir do banco. A dose que acabou de
       * ser respondida ainda cai dentro da tolerância de 2 minutos do "aviso que acabou de passar"
       * (ver `TOLERANCIA_DE_ATRASO_EM_MINUTOS`), então o aviso volta a ser agendado e dispara quase
       * na hora — e o `DELIVERED` dele abria esta tela outra vez, que montava, via tudo resolvido e
       * se fechava. O piscar visto em aparelho em 09/09.
       *
       * Com o fechamento antes, a tela já saiu quando o eco chega. O listener também aprendeu a
       * ignorá-lo (`escutar-avisos`, no `DELIVERED`), e as duas defesas são de camadas diferentes:
       * aqui o alarme não fica esperando o reagendamento para sair de cena; lá o eco não abre nada
       * mesmo que chegue por outro caminho.
       *
       * O reagendamento continua acontecendo — sem `await`, porque ninguém nesta tela depende do
       * resultado dele, e ela está saindo.
       */
      await encerrar();
      void reagendarTodosOsAvisos();
    },
    [doses, registrar, encerrar],
  );

  /**
   * Leva à tela do horário dentro do app, onde cada dose se resolve individualmente.
   *
   * Por deep link, e não pelo roteador: esta tela é um componente registrado no `AppRegistry` (ver
   * `index.js`) e roda numa Activity própria, fora do `expo-router` — não há navegador a que pedir
   * um `push`. O `Linking` entrega a rota ao app, que sobe já na tela certa.
   *
   * Silencia e dispensa antes de sair, na mesma ordem do `encerrar`: sem isso o som continuaria
   * tocando por cima do app recém-aberto.
   */
  const abrirNoApp = useCallback(async () => {
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

  /**
   * A dose respondida em **outro lugar** também encerra este alarme.
   *
   * O `useDosesDoAlarme` revalida a cada poucos segundos, então quando alguém confirma pelo botão
   * da notificação — que continua na bandeja enquanto o alarme toca — a lista aqui esvazia sozinha.
   * Sem isto, a tela permanecia tocando e oferecendo "Tomei" para uma dose já registrada: o segundo
   * toque não gravaria nada (a regra barra), mas o alarme seguiria berrando o que já foi resolvido.
   *
   * `isLoading` na condição é o que impede o fechamento no primeiro quadro, antes de a lista chegar.
   */
  /**
   * Tocar no corpo da notificação leva à tela do horário — e o alarme sai de cena no mesmo gesto.
   *
   * Escolher outro caminho para responder é uma resposta ao alarme: continuar tocando enquanto a
   * pessoa decide na outra tela é cobrar algo que ela já foi atender. Equivale a "Responder
   * depois" — a dose segue pendente, e é lá que ela será resolvida.
   */
  useEffect(() => ouvirPedidoDeEncerrarAlarme(onFechar), [onFechar]);

  /**
   * **Perder o primeiro plano encerra o alarme.** É esta a garantia que funciona.
   *
   * O aviso interno (`ouvirPedidoDeEncerrarAlarme`, acima) não alcança esta tela quando o toque na
   * notificação é processado pelo `onBackgroundEvent`: aquele handler roda num contexto JS separado
   * da Activity do alarme, e o `Set` de ouvintes vive na memória de cada contexto — o anúncio se
   * perde no caminho. Foi o que o teste em aparelho mostrou: o app abria por cima e o som
   * continuava, obrigando a voltar telas para achar o alarme e desligá-lo.
   *
   * `AppState` não depende de contexto compartilhado: quando o app sobe por cima, esta Activity vai
   * para segundo plano e o evento chega aqui. E a regra vale para **qualquer** saída — tocar na
   * notificação, abrir outro app, atender uma chamada. Em todas, o alarme deixou de ser o que está
   * na frente, e um despertador que continua tocando fora de cena é o que faz desinstalar o app.
   *
   * A dose segue pendente: sair não é responder, e ela reaparece na Home como atrasada.
   */
  useEffect(() => {
    /**
     * Só vale para a Activity de tela cheia, e não para esta mesma tela aberta como rota.
     *
     * Quando o alarme chega com o app já aberto, o Android rebaixa o full-screen intent e quem abre
     * a tela é o roteador (ver `use-dose-notifications`). Ali o app **é** o primeiro plano, e um
     * `inactive` passageiro — o heads-up que sobe por cima, a barra de notificações puxada —
     * fecharia o alarme sem que ninguém tivesse saído dele.
     *
     * Na Activity própria a semântica é outra: ela existe sozinha, então perder o primeiro plano
     * significa que outra coisa veio para a frente.
     */
    if (!ehActivityDeAlarme) return;

    /**
     * Só encerra depois de ter estado em primeiro plano ao menos uma vez.
     *
     * A Activity nasce enquanto o aparelho ainda desbloqueia, e nesse intervalo o `AppState` pode
     * reportar `inactive` — fechar ali mataria o alarme antes de alguém vê-lo, que é o pior defeito
     * possível nesta tela.
     */
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

  useEffect(() => {
    if (isLoading) return;
    if (doses.length === 0) return;
    if (doses.some((dose) => !dose.resolvida)) return;

    /**
     * Fecha sem passar pelo `encerrar`: aquele chama `setSilenciado`, e escrever estado dentro de um
     * efeito é o que a regra `set-state-in-effect` proíbe — com razão, porque aqui o componente está
     * saindo e o re-render não teria para quem servir.
     *
     * O som já morre com a tela: o player é criado e destruído pelo efeito do áudio, e a limpeza
     * dele roda na desmontagem.
     */
    void dispensarAlarmeAtivo().then(onFechar);
  }, [doses, isLoading, onFechar]);

  if (isLoading) return <CenteredLoader />;

  const pendentes = doses.filter((dose) => !dose.resolvida);
  const umaSo = pendentes.length === 1;
  /**
   * **Com mais de uma dose, o alarme lista e não responde**: a confirmação passa a exigir o app.
   *
   * O argumento original valia para cinco remédios e continua valendo para dois: marcar "tomei
   * todas" no escuro e recém-acordado é assinar vários registros clínicos com um toque só, sem ter
   * olhado nenhum deles. O que mudou em 09/09 foi onde a linha é traçada — de três para um.
   *
   * ⚠️ O custo é real e recai sobre quem tem mais remédios: o paciente polimedicado, que costuma
   * ser idoso e é quem mais se beneficiaria do botão direto. O `Ver e confirmar no app` é o que
   * torna isso aceitável — ele é a primeira coisa na tela e leva ao horário, onde cada dose se
   * resolve individualmente.
   */
  const podeResponderAqui = pendentes.length <= MAXIMO_PARA_RESPONDER_NO_ALARME;
  /**
   * Se a tela lista os remédios ou só diz quantos são. Ver `MAXIMO_PARA_LISTAR`.
   *
   * A outra forma — detalhada contra enxuta — é decidida por `umaSo`, e não por uma terceira
   * variável: é a mesma pergunta ("há uma dose só?") que já governa o título e os botões.
   */
  const listar = pendentes.length <= MAXIMO_PARA_LISTAR;
  // Um adiamento por horário: basta uma dose já ter gasto o dela para o botão não ter mais efeito.
  const podeAdiar = pendentes.length > 0 && pendentes.every((dose) => dose.snoozeCount === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/**
       * O cabeçalho e os remédios rolam; as ações ficam fixas no rodapé.
       *
       * A tela cabia justa com **um** remédio — e o bloco 4.1 do roteiro é justamente dois no mesmo
       * horário, cada um com sua foto. Sem rolagem, o segundo cartão empurrava "Responder depois"
       * para fora da tela, e não havia como alcançá-lo: numa tela que irrompe sobre o bloqueio e
       * toca em loop, ficar sem saída visível é o pior defeito possível.
       *
       * As ações fora do scroll porque elas nunca podem depender de rolar: quem foi acordado tem
       * que conseguir responder sem procurar.
       */}
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <View style={styles.icone}>
            <Ionicons name="alarm" size={28} color={cores.onPrimary} />
          </View>
          {/* A contagem entra quando há mais de um: é ela que diz, antes de qualquer nome, quantas
              respostas este horário espera. */}
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

        {/* Os remédios, em letra grande: é o que a pessoa precisa ler antes de responder, e ela
            pode estar sem óculos, no escuro, recém-acordada. */}
        {/**
         * Acima de três, a tela **não lista**.
         *
         * Listar cinco nomes numa tela que irrompe de madrugada é dar trabalho a quem acabou de
         * acordar, sem ajudar a decidir nada: a resposta já não acontece aqui (ver
         * `podeResponderAqui`), e quem vai conferir cinco doses vai fazê-lo no app, onde cada uma
         * tem seu botão. A contagem no título já diz o tamanho do que espera.
         */}
        {!listar ? (
          <Text style={styles.resumo}>Toque abaixo para ver quais são e confirmar cada uma.</Text>
        ) : null}

        <View style={styles.lista}>
          {(listar ? pendentes : []).map((dose) => (
            <View key={dose.doseScheduleId} style={umaSo ? styles.item : styles.itemEnxuto}>
              {/**
               * A foto da caixa, quando existe.
               *
               * Reconhecer a embalagem é mais rápido que ler o nome — e às 6 da manhã, sem óculos,
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
                 * Na lista, a foto vira **miniatura ao lado do texto**.
                 *
                 * Ela fica porque reconhecer a caixa vale igual com três remédios — é até mais útil
                 * ali, onde a pessoa precisa distinguir uma caixa das outras. O que não cabe é o
                 * tamanho: três fotos de 132dp empilhadas não deixam espaço para mais nada, e a tela
                 * de 12/09 já estava poluída **sem** elas.
                 *
                 * 48dp é o que se reconhece de relance sem tomar a linha, e `cover` porque nesse
                 * tamanho a moldura inteira da caixa não se lê de qualquer forma — o que resta é a
                 * cor e a forma, que é justamente o que distingue uma da outra.
                 */
                <View style={styles.linhaDoItem}>
                  {dose.photoUri !== null ? (
                    <FotoLocal uri={dose.photoUri} style={styles.miniatura} contentFit="cover" />
                  ) : null}
                  {/**
                   * **Nada é omitido aqui** — o que muda é o corpo, não o conteúdo.
                   *
                   * Nome, dose, onde está e como tomar são informação clínica: quem toma em jejum
                   * precisa saber disso no instante em que levanta, não depois de já ter comido.
                   * Cheguei a cortar a orientação para a lista caber, e era a decisão errada —
                   * caber é problema de tamanho, e se resolve reduzindo a escala do conjunto.
                   */}
                  <View style={styles.textoDoItem}>
                    <Text style={styles.nomeCompacto}>{dose.medicationName}</Text>
                    <Text style={styles.quantidadeCompacta}>{dose.quantidadeFormatada}</Text>
                    {dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
                      <Text style={styles.orientacaoCompacta}>{dose.intakeNote}</Text>
                    ) : null}
                    {/* O local fecha a coluna de texto, alinhado com o nome — com ou sem foto. */}
                    {dose.storageLocation !== null && dose.storageLocation.length > 0 ? (
                      <View style={styles.localEnxuto}>
                        <Ionicons name="location-outline" size={13} color={cores.onPrimary} />
                        <Text style={styles.localCompacto}>{dose.storageLocation}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
              {/* A orientação de tomada só na tela de uma dose: com três, ela é a linha que mais
                  cresce (costuma ser uma frase inteira) e a que menos decide se a pessoa levanta —
                  ela se lê na hora de tomar, no app, não no instante do despertar. */}
              {umaSo && dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
                <Text style={styles.orientacao}>{dose.intakeNote}</Text>
              ) : null}
              {/* Onde a caixa está guardada.

                  Pequeno e por último: não é o que se lê primeiro, mas é o que faz a pessoa sair do
                  lugar. Quem acorda às 6h com o alarme precisa saber para onde ir, e este campo mora
                  na tela de estoque — que ninguém abre no meio da noite. O ícone evita confundi-lo
                  com a orientação de tomada logo acima, que também é texto miúdo em cinza. */}
              {umaSo && dose.storageLocation !== null && dose.storageLocation.length > 0 ? (
                <View style={styles.local}>
                  <Ionicons name="location-outline" size={14} color={cores.onPrimary} />
                  <Text style={styles.localTexto}>{dose.storageLocation}</Text>
                </View>
              ) : null}
            </View>
          ))}
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

          {/* As duas respostas na mesma linha, dividindo a largura — e com ícone, porque quem
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

          {/* Silenciar e Adiar dividem a linha: nenhum dos dois registra desfecho, e juntos ocupam
              a altura de um. O espaço economizado vai para a foto do remédio, que é o que a tela
              tem de mais útil quando ela existe.

              Silenciar vira aviso quando já foi tocado, e Adiar some quando o horário gastou seu
              adiamento — então a linha pode ter dois, um ou nenhum botão. */}
          {silenciado ? (
            <Text style={styles.silenciadoAviso}>
              Som desligado. A dose continua esperando sua resposta.
            </Text>
          ) : null}

          {!silenciado || podeAdiar ? (
            <View style={styles.linhaDeSaidas}>
              {!silenciado ? (
                <Pressable
                  style={estadoDePressao(styles.botaoSilenciar)}
                  onPress={silenciar}
                  accessibilityRole="button"
                  accessibilityLabel="Desligar o som do alarme">
                  <Ionicons name="volume-mute" size={18} color={cores.onPrimary} />
                  <Text style={styles.textoSilenciar}>Silenciar</Text>
                </Pressable>
              ) : null}

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
          ) : null}

          {/* Sair sem responder é legítimo — a pessoa pode querer conferir a caixa antes. A dose
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
