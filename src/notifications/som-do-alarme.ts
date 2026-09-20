import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import notifee from "react-native-notify-kit";
import { Platform } from "react-native";

const SOM_DO_ALARME = require("../../assets/sounds/alarme_de_dose.wav");

/**
 * Quem toca o som do alarme: o app, e nao o sistema.
 *
 * Pelo canal da notificacao havia dois defeitos que sao o mesmo. O volume errado, porque o
 * `AudioAttributes` do canal pede `USAGE_ALARM` e o Android trata como dica, nao ordem; e o
 * silencio com o celular em uso, em que ele rebaixa a tela cheia e nao toca nada, com o canal
 * sonoro e os volumes altos.
 *
 * Dentro de um foreground service porque a tela do alarme nem sempre monta, e um player preso ao
 * ciclo de vida dela emudeceria nos casos em que o alarme mais importa. E o que os requisitos do
 * Play para apps de alarme descrevem.
 */

/** Fora de componente: quem o para pode ser um handler de segundo plano. */
let tocando: AudioPlayer | null = null;

/**
 * Rede de seguranca do loop.
 *
 * `loop` e resolvido do lado nativo e funciona, mas um alarme de medicacao nao pode depender de uma
 * garantia so: com o foco de audio disputado por outro app, o player pausa sem sinal nenhum e a
 * pessoa continua dormindo.
 */
let vigia: ReturnType<typeof setInterval> | null = null;

/**
 * Comeca a tocar. Idempotente.
 *
 * Dois caminhos pedem o som: o servico, quando a notificacao e entregue, e a tela, quando ela
 * monta. Sem isto, dois players tocando o mesmo arquivo.
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
 * Chamado de todo caminho que resolve o alarme. O som nao morre junto com a notificacao, entao
 * para-lo e responsabilidade do app, e som que sobrevive a resposta faz desinstalar.
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
 * quando `pararDeSoar` é chamado e o serviço é encerrado - daí o laço de espera abaixo, que é o
 * formato que a biblioteca pede.
 */
export function registrarServicoDeSom(): void {
  if (Platform.OS !== "android") return;

  notifee.registerForegroundService(() => {
    return new Promise<void>((resolve) => {
      comecarASoar();

      // Por intervalo, e nao expondo um `resolve` para fora: o `runner` pode ser chamado mais de
      // uma vez pelo Android, e um `resolve` global faria a segunda chamada encerrar a primeira.
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
