const { withDangerousMod } = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

/**
 * Faz o alarme sair no **volume de despertador**, e não no de mídia.
 *
 * ## O defeito
 *
 * O Gabriel testou em 12/09 e descreveu com precisão: o alarme tocava no mesmo volume das músicas e
 * dos vídeos, e não no do ícone de relógio. A notificação estava certa (volume de aviso); só o
 * alarme errava.
 *
 * O comentário em `canais-notifee.ts` afirmava que o alarme saía "no volume de alarme" — e **nada no
 * código dizia isso ao Android**. Era uma intenção escrita em português que nunca virou instrução.
 *
 * ## Por que isso importa mais do que parece
 *
 * O stream de áudio decide três coisas de uma vez, e as três são a promessa do modo alarme:
 *
 * 1. **Qual botão de volume manda.** Quem baixa o volume de um vídeo à noite baixava o alarme junto,
 *    sem saber.
 * 2. **Se toca no silencioso.** O silencioso do Android silencia mídia e notificação; o volume de
 *    despertador é justamente o que ele **não** corta. É por isso que o Gabriel disse que "uma coisa
 *    resolve a outra" — e está certo: este plugin é a correção dos dois relatos.
 * 3. **Se some no Não Perturbe.** `bypassDnd` cobre a notificação, mas o áudio ainda seguia a regra
 *    do stream de mídia.
 *
 * Num app de adesão medicamentosa isso é o núcleo do que o modo alarme promete: o app oferece duas
 * opções no cadastro, e a diferença entre elas tem de ser real. Prometer "toca alto, mesmo no
 * silencioso" e sair no volume de mídia é falha de correspondência com o mundo real (Nielsen) — e,
 * aqui, uma promessa de segurança falsa.
 *
 * ## Por que um patch no Java, e não uma opção da biblioteca
 *
 * Porque a opção não existe. `ChannelManager.java` monta o `AudioAttributes` com
 * `USAGE_NOTIFICATION` **fixo**, para todo canal, sem nada no JS que sobrescreva — conferido na
 * tipagem de `NotificationAndroid.d.ts`, que expõe `sound`, `vibration` e `importance`, e nenhum
 * campo de áudio. A biblioteca foi arquivada em 07/04/2026, então não há versão nova a esperar.
 *
 * O `AudioAttributes` do canal é o único lugar onde isso se decide: o Android lê o stream do canal,
 * não da notificação. Mudar no agendamento não teria efeito nenhum.
 *
 * ## Por que `withDangerousMod`
 *
 * O projeto é *managed*: `node_modules/` é reinstalado e `android/` é regenerado a cada build, então
 * editar o arquivo na mão se perde no próximo `prebuild`. Este mod roda **antes** da compilação, no
 * diretório já materializado, e a mudança entra em toda build sem depender de ninguém lembrar.
 *
 * É "dangerous" no nome porque mexe fora do modelo de configuração do Expo. A mitigação está abaixo:
 * o patch **falha a build** se o alvo não for encontrado, em vez de seguir em silêncio.
 */

/** O arquivo da biblioteca que decide o stream de áudio de todo canal. */
const ARQUIVO_ALVO = path.join(
  "node_modules",
  "react-native-notify-kit",
  "android",
  "src",
  "main",
  "java",
  "app",
  "notifee",
  "core",
  "ChannelManager.java",
);

/**
 * O trecho exato a substituir, com a indentação do arquivo.
 *
 * Casar o bloco inteiro, e não só a palavra `USAGE_NOTIFICATION`, é deliberado: se a biblioteca for
 * atualizada e este código mudar de forma, o patch **não** encontra o alvo e a build para com uma
 * mensagem explicando o que houve. A alternativa — um `replace` frouxo que casa qualquer coisa —
 * aplicaria a mudança no lugar errado sem avisar, que é como um patch vira um defeito silencioso.
 */
const ORIGINAL = `                  AudioAttributes audioAttributes =
                      new AudioAttributes.Builder()
                          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                          .build();`;

/**
 * O bloco novo: o canal escolhe o stream conforme o id.
 *
 * `USAGE_ALARM` só para o canal do alarme — o id vem de `canais-notifee.ts` e é comparado por
 * prefixo, porque ele carrega versão (`dose-alarm-v5`) e a versão sobe quando som ou importância
 * mudam. Comparar o id inteiro faria o patch parar de valer exatamente na próxima vez que alguém
 * subisse a versão do canal, que é quando ele mais precisa valer.
 *
 * O canal de lembrete continua em `USAGE_NOTIFICATION`, e isso é a decisão, não um resto: ele
 * promete respeitar o silencioso. Os dois canais existem para serem diferentes.
 */
const PATCH = `                  // [Mapill] O stream de áudio decide qual botão de volume manda, se o som
                  // atravessa o silencioso e se o Não Perturbe o corta. O canal do alarme precisa do
                  // volume de despertador para cumprir o que o app promete no cadastro; o de
                  // lembrete segue em notificação de propósito. Ver plugins/volume-de-despertador.js
                  boolean ehCanalDeAlarme = channelModel.getId().startsWith("dose-alarm");
                  AudioAttributes audioAttributes =
                      new AudioAttributes.Builder()
                          .setUsage(
                              ehCanalDeAlarme
                                  ? AudioAttributes.USAGE_ALARM
                                  : AudioAttributes.USAGE_NOTIFICATION)
                          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                          .build();`;

module.exports = function withVolumeDeDespertador(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const alvo = path.join(config.modRequest.projectRoot, ARQUIVO_ALVO);

      if (!fs.existsSync(alvo)) {
        throw new Error(
          `[volume-de-despertador] ${ARQUIVO_ALVO} não existe. A biblioteca de notificação mudou de ` +
            `estrutura ou não foi instalada — sem este patch o alarme toca no volume de mídia.`,
        );
      }

      const conteudo = fs.readFileSync(alvo, "utf8");

      // Já aplicado: `prebuild` roda mais de uma vez, e aplicar duas vezes quebraria o Java.
      if (conteudo.includes("ehCanalDeAlarme")) return config;

      if (!conteudo.includes(ORIGINAL)) {
        throw new Error(
          `[volume-de-despertador] o bloco de AudioAttributes não foi encontrado em ${ARQUIVO_ALVO}. ` +
            `A biblioteca provavelmente foi atualizada. Confira o arquivo e ajuste o patch — sem ` +
            `ele o alarme volta a tocar no volume de mídia, sem erro nenhum na build.`,
        );
      }

      fs.writeFileSync(alvo, conteudo.replace(ORIGINAL, PATCH), "utf8");

      return config;
    },
  ]);
};
