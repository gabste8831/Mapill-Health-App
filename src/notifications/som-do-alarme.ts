import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import notifee from "react-native-notify-kit";
import { Platform } from "react-native";

const SOM_DO_ALARME = require("../../assets/sounds/alarme_de_dose.wav");

/**
 * Quem toca o som do alarme — **o app, e não o sistema**.
 *
 * ## Por que existe
 *
 * O som vinha do canal da notificação, tocado pelo NotificationManager. Isso trouxe dois defeitos
 * que são o mesmo defeito:
 *
 * - **O volume errado.** O `AudioAttributes` do canal pede `USAGE_ALARM` e o Android ignora — ali o
 *   atributo é dica, não ordem. Duas builds foram gastas provando isso, e a issue #297 do Notifee,
 *   pedindo exatamente isto, foi fechada como *not planned*.
 * - **O silêncio com o celular em uso.** Testado em 14/09: com o aparelho destravado o Android
 *   rebaixa a tela cheia para heads-up e **não toca som nenhum**, com o canal sonoro e todos os
 *   volumes altos. Sem causa documentada, e sem conserto pelo lado do canal.
 *
 * Tocando daqui, os dois somem de uma vez: o stream é escolha do app (ver
 * `plugins/som-do-alarme-em-despertador.js`), e o disparo não depende de o Android decidir tocar.
 *
 * ## Por que dentro de um foreground service
 *
 * Porque a tela do alarme **nem sempre monta**: com o celular em uso o Android rebaixa o full-screen
 * intent, e com o app fechado não há processo para navegar. Um player preso ao ciclo de vida de uma
 * tela emudeceria exatamente nos casos em que o alarme mais importa.
 *
 * O serviço é o que os [requisitos do Play para apps de
 * alarme](https://support.google.com/googleplay/android-developer/answer/13392821) descrevem, e o
 * que mantém o processo vivo enquanto o som toca.
 */

/** O player em curso. Fora de componente: quem o para pode ser um handler de segundo plano. */
let tocando: AudioPlayer | null = null;

/**
 * Rede de segurança do loop, igual à que a tela do alarme já tinha.
 *
 * `loop` é resolvido do lado nativo e funciona. Mas um alarme de medicação não pode depender de uma
 * garantia só: se o sistema pausar o player — foco de áudio disputado com outro app —, o alarme
 * emudece sem sinal nenhum, e a pessoa continua dormindo.
 */
let vigia: ReturnType<typeof setInterval> | null = null;

/**
 * Começa a tocar. Idempotente: chamar de novo com o som já tocando não cria um segundo player.
 *
 * A idempotência importa porque há dois caminhos que podem pedir o som — o serviço, quando a
 * notificação é entregue, e a tela do alarme, quando ela monta. Dois players tocando o mesmo arquivo
 * é o som duplicado relatado em 10/09.
 */
export function comecarASoar(): void {
  if (Platform.OS !== "android" || tocando !== null) return;

  const player = createAudioPlayer(SOM_DO_ALARME);
  player.loop = true;
  player.play();
  tocando = player;

  vigia = setInterval(() => {
    if (tocando !== null && !tocando.playing) tocando.play();
  }, 6_000);
}

/**
 * Para o som e libera o recurso nativo.
 *
 * **Chamado de todo caminho que resolve o alarme** — os botões da tela, o toque na notificação, a
 * dose respondida em outro lugar. Som que sobrevive à resposta é o defeito que faz desinstalar o
 * app, e aqui ele é mais fácil de produzir que antes: o som deixou de morrer junto com a
 * notificação, então parar virou responsabilidade nossa.
 */
export function pararDeSoar(): void {
  if (vigia !== null) {
    clearInterval(vigia);
    vigia = null;
  }
  if (tocando !== null) {
    tocando.pause();
    tocando.release();
    tocando = null;
  }
}

/**
 * Registra o serviço. Chamado uma vez, no `index.js`, antes de qualquer aviso poder chegar.
 *
 * O `runner` fica vivo enquanto o serviço estiver de pé, e é o que segura o processo. Ele resolve
 * quando `pararDeSoar` é chamado e o serviço é encerrado — daí o laço de espera abaixo, que é o
 * formato que a biblioteca pede.
 */
export function registrarServicoDeSom(): void {
  if (Platform.OS !== "android") return;

  notifee.registerForegroundService(() => {
    return new Promise<void>((resolve) => {
      comecarASoar();

      /**
       * Enquanto o som toca, o serviço vive. A promessa resolve quando ele para.
       *
       * Checar por intervalo em vez de expor um `resolve` para fora é deliberado: o `runner` pode
       * ser chamado mais de uma vez pelo Android, e guardar um `resolve` global faria a segunda
       * chamada encerrar a primeira. Aqui cada execução observa o próprio estado.
       */
      const aguardar = setInterval(() => {
        if (tocando === null) {
          clearInterval(aguardar);
          void notifee.stopForegroundService().catch(() => {});
          resolve();
        }
      }, 500);
    });
  });
}
