const { withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

/**
 * ⚠️ **NÃO REGISTRADO NO `app.json`, e registrá-lo sozinho deixa o alarme MUDO.**
 *
 * Este plugin está pronto e correto, mas é **metade** do E.1. Ele só vale junto com o canal do
 * alarme mudo — e silenciar o canal, hoje, abre um buraco pior do que o que fecha.
 *
 * ## O buraco, medido em 14/09
 *
 * Com o canal mudo, quem toca é a `AlarmeScreen`. Mas ela nem sempre monta:
 *
 * - **App fechado há horas + celular em uso** (o caso mais comum do dia): o Android rebaixa o
 *   full-screen intent, então a Activity não sobe; e o processo está morto, então o listener que
 *   abriria a rota não existe (`aoDispararAlarme` é `null` em `escutar-avisos.ts`). Ninguém toca
 *   nada. **Um despertador que não desperta.**
 * - **Banco lento no arranque**: a Activity sobe e fica no loader, `jaEstaEmCena` responde `true`,
 *   e o caminho tardio de `use-dose-notifications` desiste. Tela azul parada e muda.
 *
 * Hoje esses casos são cobertos pelo `loopSound: true` do canal (`notifee-gateway.ts`), que é o
 * `FLAG_INSISTENT` do Android repetindo o som **do canal**. Canal mudo, e esse piso desaparece —
 * o `loopSound` continua no código, mas repetindo silêncio.
 *
 * ## O que falta para ele valer
 *
 * Um **foreground service** tocando o som, independente de tela e de processo vivo. É o que os
 * requisitos do Play descrevem para apps de alarme, e a biblioteca já expõe o necessário:
 * `registerForegroundService` e `asForegroundService: true` — não é código nativo novo.
 *
 * Feito isso, registrar este plugin no `app.json`, deixar o canal mudo (subindo a versão dele, que
 * é imutável no aparelho), e revisar o `loopSound`, que vira letra morta.
 *
 * ---
 *
 * Faz o som que **o app** toca sair no volume de despertador.
 *
 * ## Por que existe, e por que não é o `volume-de-despertador`
 *
 * Aquele plugin ensina o **canal** a pedir `USAGE_ALARM`, e o pedido não é atendido: quem toca o som
 * da notificação é o NotificationManager, e ali o `AudioAttributes` é dica, não ordem. Foram duas
 * builds para medir isso (ver o anexo do `ROTEIRO-DE-TESTE.md`).
 *
 * A saída é separar quem mostra de quem toca: o canal do alarme fica mudo e a tela toca o próprio
 * som, com `expo-audio`. Aí o stream passa a ser escolha do app — e é isto que este plugin acerta.
 *
 * ## Por que precisa de patch
 *
 * O `expo-audio` não expõe a escolha de stream: tem `interruptionMode` e `playsInSilentMode`, e nada
 * de `androidAudioUsage`. O player nasce com `AudioAttributes.DEFAULT`, que é `USAGE_MEDIA` — o
 * volume de música. Sem mexer aqui, o alarme continua saindo por onde saía.
 *
 * ## Por que o patch é global, e por que isso é seguro
 *
 * O alvo é o construtor do `AudioPlayer`, então **todo** player do app nasce como alarme. Parece
 * exagero e não é: o único `expo-audio` do projeto é o loop da tela do alarme
 * (`AlarmeScreen.tsx`) — todo player do app já é o do alarme.
 *
 * **Se algum dia o app tocar outro som** — um toque de confirmação, um aviso curto —, ele herdaria
 * `USAGE_ALARM` e sairia no volume errado, atravessando o silencioso. O sinal de que este comentário
 * precisa virar código é um segundo `createAudioPlayer` no projeto; aí o patch tem de passar a
 * distinguir os players, como o `volume-de-despertador` distingue os canais pelo id.
 *
 * ## Por que `withDangerousMod`
 *
 * Mesmo motivo do plugin irmão: `node_modules/` é reinstalado a cada build, então editar na mão se
 * perde. Este mod roda antes da compilação, no diretório já materializado. E, como lá, ele **falha a
 * build** se o alvo mudar de forma — um patch que não encontra o alvo e segue calado é pior que
 * patch nenhum, porque o defeito volta sem nada na saída da build para denunciá-lo.
 */

/** O arquivo do `expo-audio` onde todo player nasce. */
const ARQUIVO_ALVO = path.join(
  "node_modules",
  "expo-audio",
  "android",
  "src",
  "main",
  "java",
  "expo",
  "modules",
  "audio",
  "AudioPlayer.kt",
);

/**
 * O trecho exato a substituir, com a indentação do arquivo.
 *
 * Casar a linha inteira, e não só `AudioAttributes.DEFAULT`, é o mesmo cuidado do plugin irmão: se o
 * `expo-audio` for atualizado e esta construção mudar, o patch não encontra o alvo e a build para
 * com uma mensagem — em vez de aplicar no lugar errado ou deixar passar em silêncio.
 */
const ORIGINAL = `    .setAudioAttributes(AudioAttributes.DEFAULT, false)`;

/**
 * O bloco novo.
 *
 * `C.USAGE_ALARM` é o que faz o botão de volume do despertador mandar no som, o silencioso não o
 * cortar e o Não Perturbe respeitá-lo como alarme. `CONTENT_TYPE_SONIFICATION` descreve o que ele é:
 * um aviso funcional, não música — é o mesmo par que o canal do alarme já pede.
 *
 * O segundo argumento (`handleAudioFocus`) segue `false`, como estava. Ligá-lo faria o player
 * devolver o foco a outro app que o peça, e um alarme de medicação que se cala porque um vídeo
 * começou é exatamente o que ele não pode fazer.
 *
 * As duas classes já estão importadas no arquivo (`androidx.media3.common.AudioAttributes` e
 * `androidx.media3.common.C`), então o patch não precisa mexer nos imports.
 */
const PATCH = `    // [Mapill] O som do alarme sai no volume de DESPERTADOR, e não no de mídia.
    // Sem isto o alarme fica no volume de música: com a mídia baixa, ele não acorda ninguém.
    // Ver plugins/som-do-alarme-em-despertador.js
    .setAudioAttributes(
      AudioAttributes.Builder()
        .setUsage(C.USAGE_ALARM)
        .setContentType(C.AUDIO_CONTENT_TYPE_SONIFICATION)
        .build(),
      false,
    )`;

/** A marca do patch no arquivo, para não aplicar duas vezes. `prebuild` roda mais de uma vez. */
const MARCA = "C.USAGE_ALARM";

function withSomDoAlarmeEmDespertador(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const alvo = path.join(config.modRequest.projectRoot, ARQUIVO_ALVO);

      if (!fs.existsSync(alvo)) {
        throw new Error(
          `[som-do-alarme-em-despertador] ${ARQUIVO_ALVO} não existe. O expo-audio mudou de ` +
            `estrutura ou não foi instalado — sem este patch o alarme toca no volume de mídia.`,
        );
      }

      const conteudo = fs.readFileSync(alvo, "utf8");

      if (conteudo.includes(MARCA)) return config;

      if (!conteudo.includes(ORIGINAL)) {
        throw new Error(
          `[som-do-alarme-em-despertador] a linha de setAudioAttributes não foi encontrada em ` +
            `${ARQUIVO_ALVO}. O expo-audio provavelmente foi atualizado. Confira o arquivo e ajuste ` +
            `o patch — sem ele o alarme volta ao volume de mídia, sem erro nenhum na build.`,
        );
      }

      fs.writeFileSync(alvo, conteudo.replace(ORIGINAL, PATCH), "utf8");

      return config;
    },
  ]);
}

module.exports = withSomDoAlarmeEmDespertador;
