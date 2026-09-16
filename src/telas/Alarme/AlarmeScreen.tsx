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
 * ## O som **não** mora aqui — desde 14/09
 *
 * Morava: esta tela criava o próprio player e o destruía ao fechar. O problema é que ela nem sempre
 * monta — com o celular em uso o Android rebaixa a tela cheia, e com o app fechado não há processo
 * para navegar —, e nesses casos o alarme ficava mudo.
 *
 * Agora quem toca é o foreground service (ver `som-do-alarme.ts`), que sobe com a notificação e
 * independe de tela. Esta tela **pede** o som ao montar (é idempotente) e o para ao ser respondida,
 * mas não o possui: fechá-la não cala um alarme que ninguém respondeu.
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
   * A notificação do horário sai da bandeja — mas **só com a tela de fato visível**.
   *
   * O serviço em primeiro plano e esta tela pediriam o mesmo som se coexistissem — por isso
   * `comecarASoar` é idempotente. Quando esta tela está na frente, ela é quem responde, e a
   * notificação pode sair da bandeja.
   *
   * ## Por que a condição virou explícita em 12/09
   *
   * Ela era garantida por quem abre: `use-dose-notifications` recusava montar a tela com o app fora
   * do primeiro plano, então chegar aqui já significava estar visível. Isso mudou — agora, com o
   * aparelho bloqueado e a Activity nativa ausente, o app abre a rota assim mesmo, porque era esse
   * o defeito que fazia a tela azul não aparecer com o Mapill nos recentes.
   *
   * A condição continua valendo, mas deixou de ser garantida lá fora. Se a tela montar sem estar
   * visível — o caso que a espera tenta evitar, e nenhuma heurística acerta sempre —, dispensar a
   * notificação apagaria o **único** aviso visível e deixaria o som sem rosto nem forma de parar.
   * Trocar o problema barulhento pelo mudo é o pior desfecho possível aqui.
   *
   * Então a tela pergunta por si: como Activity do full-screen intent ela está na frente por
   * definição (o Android a colocou lá); como rota, ela só dispensa se o app estiver `active`.
   *
   * `dispensar(chave)` e não `dispensarAlarmeAtivo()`: aquela varre todos os alarmes da bandeja, e
   * um alarme de outro horário ainda sem resposta não tem por que sumir porque esta tela abriu.
   */
  useEffect(() => {
    if (!ehActivityDeAlarme && AppState.currentState !== "active") return;
    void new NotifeeGateway().dispensar(chaveDoHorario(instanteIso));
  }, [instanteIso, ehActivityDeAlarme]);

  /**
   * O som, enquanto a dose não for respondida.
   *
   * Quem toca é o serviço em primeiro plano (`som-do-alarme.ts`), não esta tela — ver os dois
   * blocos abaixo, que explicam por quê.
   */
  useEffect(() => {
    if (silenciado) return;

    /**
     * **Pede o som ao módulo compartilhado, em vez de criar o próprio player.**
     *
     * Desde o `v8` quem toca é o foreground service (ver `som-do-alarme.ts`), e ele já está tocando
     * quando esta tela monta — o alarme começa a soar com a notificação, antes de qualquer tela
     * existir. `comecarASoar` é idempotente, então chamar aqui não cria um segundo player: serve
     * para o caso em que a tela abre sem o serviço ter subido.
     *
     * Um player próprio aqui seria a segunda fonte de áudio tocando o mesmo arquivo — o som
     * duplicado de 10/09, agora com o agravante de que silenciar pela tela calaria só um dos dois.
     */
    comecarASoar();

    /**
     * **A limpeza não para o som**, e isso é a mudança de 14/09.
     *
     * O som deixou de pertencer a esta tela: ele é do serviço, e sobrevive a ela de propósito —
     * com o celular em uso a tela nem chega a montar, e o alarme precisa soar do mesmo jeito.
     * Parar na desmontagem faria a tela fechada calar um alarme que ninguém respondeu.
     *
     * Quem para é `dispensarAlarmeAtivo`, no funil por onde passam todos os caminhos que encerram
     * o alarme — inclusive o `encerrar` e o `onFechar` desta tela.
     */
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

  /**
   * Silencia sozinho depois de um tempo — ver `SILENCIA_SOZINHO_EM_MS`.
   *
   * Para o serviço junto, pelo mesmo motivo do botão: o som não é mais desta tela, e marcar o
   * estado sem pará-lo deixaria o alarme tocando para sempre num aparelho que ninguém atendeu.
   */
  useEffect(() => {
    if (silenciado) return;
    const timer = setTimeout(() => {
      pararDeSoar();
      setSilenciado(true);
    }, SILENCIA_SOZINHO_EM_MS);
    return () => clearTimeout(timer);
  }, [silenciado]);

  /**
   * Silenciar **para o serviço**, e não só marca o estado desta tela.
   *
   * Antes do `v8` bastava o estado: o player era desta tela, e o efeito o destruía ao ver
   * `silenciado`. Agora o som é do serviço e não pertence mais a ela — sem esta chamada, o botão
   * mudaria a tela e o alarme seguiria berrando.
   */
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
   *
   * **Com o aparelho bloqueado, exige o desbloqueio primeiro.** Responder a dose daqui — "Tomei",
   * "Pulei", adiar, silenciar — segue sem senha, porque é para isso que o alarme existe e o dado
   * não sai da tela. Entrar no app é outra coisa: lá estão os medicamentos, o histórico e a ficha
   * de saúde, e a tela azul sobe por cima do bloqueio sem que ninguém tenha se identificado.
   *
   * O pedido vem **antes** de silenciar e dispensar: quem desiste da senha continua com o alarme
   * tocando e a tela no lugar, que é o estado em que estava. Desligar o alarme primeiro entregaria
   * a quem cancelou exatamente o que o cancelamento recusou.
   */
  const abrirNoApp = useCallback(async () => {
    // `!== false`: na dúvida, pede. O `null` é "não consegui perguntar", e aqui ele pesa para o
    // lado oposto do que pesa em `use-dose-notifications` — lá a dúvida mostra o alarme, que é
    // inofensivo; aqui ela guarda a ficha de saúde, e deixar passar é o defeito.
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
     * O som para no `dispensarAlarmeAtivo` abaixo, que é o funil de todos os caminhos que
     * encerram um alarme — a tela desmontando não o calaria, porque ele é do serviço.
     */
    void dispensarAlarmeAtivo().then(onFechar);
  }, [doses, isLoading, onFechar]);

  /**
   * Quantos remédios a tela **desenha**, decidido uma vez e mantido.
   *
   * O número de pendentes cai enquanto a tela está aberta: o `useDosesDoAlarme` revalida a cada três
   * segundos, e uma dose confirmada pelo botão da notificação ou por outra tela some da lista. Com a
   * forma derivada direto dele, quatro remédios viravam três no meio do uso — e aí o botão único de
   * "Ver e confirmar no app" virava dois botões, a lista mínima virava a lista com foto, e o rodapé
   * inteiro se reorganizava debaixo do dedo de quem estava prestes a tocar.
   *
   * Congelar só a **forma** é o que resolve sem mentir: a lista mostra as doses de verdade, e é a
   * escolha de layout que não muda. Uma tela de alarme vive segundos, e nesse intervalo a estrutura
   * que a pessoa vê tem de ser a mesma em que ela toca.
   *
   * Vale para a montagem seguinte: fechada e reaberta, a tela recalcula com o que houver então.
   *
   * `useState` e não `useRef`: ler ref durante o render é o que a regra `react-hooks/refs` proíbe,
   * e com o React Compiler ligado ela tem razão. O estado é escrito uma vez, quando a lista chega.
   */
  const [formaCongelada, setFormaCongelada] = useState<number | null>(null);

  if (isLoading) return <CenteredLoader />;

  const pendentes = doses.filter((dose) => !dose.resolvida);

  /**
   * Congela na primeira renderização com a lista já carregada.
   *
   * Escrito durante o render, e não num efeito: é o padrão de estado derivado que o React documenta
   * (*"adjusting state when props change"*), e é o que a regra `set-state-in-effect` empurra para
   * cá. O `if` garante uma escrita só — a partir daí a condição é falsa e o render é puro.
   */
  if (formaCongelada === null) setFormaCongelada(pendentes.length);

  const quantosDesenhar = formaCongelada ?? pendentes.length;
  const umaSo = quantosDesenhar === 1;
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
  const podeResponderAqui = quantosDesenhar <= MAXIMO_PARA_RESPONDER_NO_ALARME;
  /**
   * Se a tela lista os remédios ou só diz quantos são. Ver `MAXIMO_PARA_LISTAR`.
   *
   * A outra forma — detalhada contra enxuta — é decidida por `umaSo`, e não por uma terceira
   * variável: é a mesma pergunta ("há uma dose só?") que já governa o título e os botões.
   */
  const listar = quantosDesenhar <= MAXIMO_PARA_LISTAR;
  // Um adiamento por horário: basta uma dose já ter gasto o dela para o botão não ter mais efeito.
  const podeAdiar = pendentes.length > 0 && pendentes.every((dose) => dose.snoozeCount === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/**
       * **Só os remédios rolam.** O cabeçalho fica parado no topo, as ações fixas no rodapé.
       *
       * A tela cabia justa com **um** remédio — e o bloco 4.1 do roteiro é justamente dois no mesmo
       * horário, cada um com sua foto. Sem rolagem, o segundo cartão empurrava "Responder depois"
       * para fora da tela, e não havia como alcançá-lo: numa tela que irrompe sobre o bloqueio e
       * toca em loop, ficar sem saída visível é o pior defeito possível.
       *
       * As ações fora do scroll porque elas nunca podem depender de rolar: quem foi acordado tem
       * que conseguir responder sem procurar.
       *
       * **O cabeçalho saiu do scroll em 14/09.** Ele diz que horário é este, e é a âncora da tela:
       * rolando junto, a hora sumia justamente quando a lista era longa o bastante para a pessoa
       * precisar rolar — e é aí que confirmar o horário mais importa. Quem rola procura um remédio
       * na lista, não o cabeçalho.
       */}
      <View style={styles.cabecalho}>
        {/* Sem o círculo do despertador desde 14/09: ele custava 56dp de altura no topo de uma tela
            que precisa caber três remédios, e não dizia nada que o título já não diga. Numa tela
            que irrompe sozinha tocando, ninguém precisa de um ícone para saber que é um alarme. */}
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

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        {/* Os remédios, em letra grande: é o que a pessoa precisa ler antes de responder, e ela
            pode estar sem óculos, no escuro, recém-acordada. */}
        {/**
         * Acima de três, a tela mostra **nome e dose**, e nada além disso.
         *
         * A versão anterior não listava nada: só uma frase mandando abrir o app. O Gabriel testou
         * com quatro remédios em 12/09 e o resultado era um vazio entre o horário e os botões — a
         * tela do alarme deixava de dizer o que o alarme era. "Você tem 4 remédios" sem os nomes não
         * é informação, é um aviso de que há informação em outro lugar.
         *
         * O argumento antigo — que listar cinco nomes de madrugada dá trabalho sem ajudar a decidir
         * — vale para a **lista completa**, com foto, orientação de tomada e local. Não vale para o
         * nome: ele é o que responde "é o remédio da pressão ou o do sono?", e essa pergunta a
         * pessoa faz antes de decidir se levanta agora ou daqui a pouco.
         *
         * Então a escala cai mais um degrau, em vez de a informação sumir: sem foto, sem orientação,
         * sem local, e o nome e a quantidade numa linha só por remédio. A resposta continua não
         * acontecendo aqui (ver `podeResponderAqui`), e o botão de abrir o app segue sendo o
         * caminho de confirmar cada uma.
         */}
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
        {/* Sem frase explicando o que fazer: o botão "Ver e confirmar no app", logo abaixo, já diz
            — e dizer duas vezes numa tela que se lê de madrugada é ruído, não ajuda. */}

        <View style={styles.lista}>
          {(listar ? pendentes : []).map((dose) => {
            /**
             * Se há algo a dizer além do nome e da dose.
             *
             * Sem isto, a faixa de detalhes era desenhada vazia, e o `gap` do cartão abria um vão
             * embaixo do nome — um cartão mais alto sem nada dentro. Remédio sem orientação, sem
             * observação e sem local é o caso comum de quem cadastra apressado, e ele não pode
             * parecer um cartão quebrado.
             */
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
                /**
                 * **Duas faixas, e não duas colunas.**
                 *
                 * Em cima, a foto ao lado do nome e da dose — é o par que identifica o remédio, e a
                 * foto tem altura para valer alguma coisa. Embaixo, o texto que explica a tomada,
                 * ocupando a **largura inteira** do cartão.
                 *
                 * Presas à coluna de 66% ao lado da foto, as três linhas de texto quebravam cedo e
                 * o cartão crescia em altura — com três remédios, o terceiro só aparecia rolando
                 * (visto em aparelho em 14/09). A largura toda é o mesmo conteúdo em menos linhas,
                 * e o que se ganha em altura é o terceiro cartão cabendo na tela.
                 *
                 * O vão abaixo da foto deixa de ser espaço morto: era ele que a coluna de texto
                 * não alcançava.
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

                  {/**
                   * **Nada é omitido aqui** — o que muda é o corpo, não o conteúdo.
                   *
                   * Nome, dose, onde está e como tomar são informação clínica: quem toma em jejum
                   * precisa saber disso no instante em que levanta, não depois de já ter comido.
                   * Cheguei a cortar a orientação para a lista caber, e era a decisão errada —
                   * caber é problema de tamanho, e se resolve reduzindo a escala do conjunto.
                   */}
                  {temDetalhes ? (
                  <View style={styles.detalhesDoItem}>
                    {/**
                     * As orientações marcadas no cadastro, **uma etiqueta cada**.
                     *
                     * Vêm antes do texto livre porque são a regra fechada; o livre é o complemento.
                     * O fundo próprio as separa da observação logo abaixo, que é anotação de quem
                     * cuida e não instrução da dose — duas coisas que, como texto corrido, se liam
                     * como a mesma.
                     */}
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
              {/* Orientação de tomada, texto livre e observação: o que a pessoa precisa saber
                  **antes** de engolir. Desde 14/09 aparecem também na lista de dois ou três (ver o
                  bloco compacto acima) — cortá-las ali contradizia o "nada é omitido" que a própria
                  lista promete, e "esse era em jejum?" é pergunta que se faz no instante do alarme,
                  não depois. */}
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
          {/**
           * **O rodapé não muda de forma depois do toque.**
           *
           * Antes, silenciar tirava o botão da linha e inseria um aviso de texto no lugar: o Adiar
           * ao lado esticava para a largura toda e tudo descia alguns dp. Quem tocou viu o layout
           * se reorganizar debaixo do dedo — e, num alarme, o botão seguinte muda de lugar entre a
           * intenção e o toque.
           *
           * Agora o botão **fica**, apagado e sem ação, dizendo o que aconteceu. A informação que
           * o aviso dava — que a dose continua esperando — é o que a tela inteira já comunica ao
           * permanecer aberta com os botões de resposta.
           */}
          {/* A linha existe sempre: o botão de silenciar fica nela do começo ao fim, mudando de
              estado e não de presença. O Adiar ao lado é que pode faltar — quando o horário já
              gastou seu adiamento, e isso é decidido antes de a tela abrir, não durante. */}
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
